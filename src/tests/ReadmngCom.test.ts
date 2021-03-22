import cheerio from 'cheerio'
import { APIWrapper, Source } from 'paperback-extensions-common'
import { ReadmngCom } from '../ReadmngCom/ReadmngCom'

describe('ReadmngCom Tests', function () {
    var wrapper: APIWrapper = new APIWrapper();
    var source: Source = new ReadmngCom(cheerio);
    var chai = require('chai'), expect = chai.expect, should = chai.should();
    var chaiAsPromised = require('chai-as-promised');
    chai.use(chaiAsPromised);

    var mangaId = "one-piece1";

    it("Get Manga Details", async () => {
        let details = await wrapper.getMangaDetails(source, mangaId);

        let data = details;
        expect(data.id, "Missing link").to.be.not.empty;
        expect(data.image, "Missing thumbnail").to.be.not.empty;
        expect(data.status, "Missing status").to.exist;
        expect(data.desc, "Missing description of manga").to.be.not.empty;
        expect(data.titles, "Missing titles").to.be.not.empty;
    });

    it("Get Chapters", async () => {
        let data = await wrapper.getChapters(source, mangaId);

        expect(data, `No chapters present for ID: ${mangaId}`).to.not.be.empty;

        let entry = data[0]
        expect(entry.id, "No link present").to.not.be.empty;
        expect(entry.time, "No date present").to.exist
        expect(entry.name, "No title available").to.not.be.empty
    });

    it("Get Chapter Details", async () => {
        let data = await wrapper.getChapterDetails(source, mangaId, '10');

        expect(data, "No response").to.exist;
        expect(data, "Empty response").to.not.be.empty;

        expect(data.id, "Missing link").to.be.not.empty;
        expect(data.mangaId, "Missing mangaId").to.be.not.empty;
        expect(data.pages, "No pages found").to.be.not.empty;
    });

    it("Testing Notifications", async () => {
        let date = new Date()
        date.setDate(date.getDate() - 3)
        let updates = await wrapper.filterUpdatedManga(source, date, [mangaId])
        expect(updates, "No server response").to.exist
        expect(updates, "Empty server response").to.not.be.empty
        expect(updates[0], "No updates").to.not.be.empty;
    })
})