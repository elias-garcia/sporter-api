import { SporterFrontPage } from './app.po';

describe('sporter-front App', () => {
  let page: SporterFrontPage;

  beforeEach(() => {
    page = new SporterFrontPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
