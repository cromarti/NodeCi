const Page = require('./helpers/page');

let page

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
})


describe('When logged in', async () => {
    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating');
    });

    test('can see log create form', async () => {
        const label = await page.getContentOf('form label');
    
        expect(label).toEqual('Blog Title');
    })

    describe('And using valid inputs', async () => {
        const textTitle = "My title";
        const textContent = "My content";

        beforeEach(async () => {
            await page.type('.title input', textTitle);
            await page.type('.content input', textContent);
            await page.click('form button');
        });

        test('Submitting take user to review screen', async () => {
            const text = await page.getContentOf('h5');

            expect(text).toEqual('Please confirm your entries');
        });
        test('Submitting then saving adds blog to index page', async () => {
            await page.click('button.green');
            await page.waitFor('.card');

            const title = await page.getContentOf('.card-title');
            const content = await page.getContentOf('p');
            expect(title).toEqual(textTitle);
            expect(content).toEqual(textContent);
        });
    })

    describe('And using invalid inputs', async () => {
        beforeEach(async () => {
            await page.click('form button');
        });

        test('the form shows error message', async () => {
            const titleError = await page.getContentOf('.title .red-text');
            const contentError = await page.getContentOf('.content .red-text');
            const errorMessage = "You must provide a value";

            expect(titleError).toEqual(errorMessage);
            expect(contentError).toEqual(errorMessage);
        });
    })
});

describe('When is not logged in', async () => {
    const actions = [
        {
            method: 'get',
            path: '/api/blogs'
        },
        {
            method: 'post',
            path: 'api/blogs',
            data: {
                title: 'T',
                content: 'C'
            }
        }
    ]

    test('Blog releated actions are prohibited', async () => {
        const results = await page.execRequests(actions);
        
        for(let result of results) {
            expect(result).toEqual({ error: 'You must log in!' });
        }
    })
})