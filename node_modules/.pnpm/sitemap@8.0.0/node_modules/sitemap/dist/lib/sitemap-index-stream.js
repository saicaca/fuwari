"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SitemapAndIndexStream = exports.SitemapIndexStream = exports.IndexTagNames = void 0;
const stream_1 = require("stream");
const types_1 = require("./types");
const sitemap_stream_1 = require("./sitemap-stream");
const sitemap_xml_1 = require("./sitemap-xml");
var IndexTagNames;
(function (IndexTagNames) {
    IndexTagNames["sitemap"] = "sitemap";
    IndexTagNames["loc"] = "loc";
    IndexTagNames["lastmod"] = "lastmod";
})(IndexTagNames = exports.IndexTagNames || (exports.IndexTagNames = {}));
const xmlDec = '<?xml version="1.0" encoding="UTF-8"?>';
const sitemapIndexTagStart = '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
const closetag = '</sitemapindex>';
const defaultStreamOpts = {};
/**
 * `SitemapIndexStream` is a Transform stream that takes `IndexItem`s or sitemap URL strings and outputs a stream of sitemap index XML.
 *
 * It automatically handles the XML declaration and the opening and closing tags for the sitemap index.
 *
 * ⚠️ CAUTION: This object is `readable` and must be read (e.g. piped to a file or to /dev/null)
 * before `finish` will be emitted. Failure to read the stream will result in hangs.
 *
 * @extends {Transform}
 */
class SitemapIndexStream extends stream_1.Transform {
    /**
     * `SitemapIndexStream` is a Transform stream that takes `IndexItem`s or sitemap URL strings and outputs a stream of sitemap index XML.
     *
     * It automatically handles the XML declaration and the opening and closing tags for the sitemap index.
     *
     * ⚠️ CAUTION: This object is `readable` and must be read (e.g. piped to a file or to /dev/null)
     * before `finish` will be emitted. Failure to read the stream will result in hangs.
     *
     * @param {SitemapIndexStreamOptions} [opts=defaultStreamOpts] - Stream options.
     */
    constructor(opts = defaultStreamOpts) {
        var _a;
        opts.objectMode = true;
        super(opts);
        this.hasHeadOutput = false;
        this.lastmodDateOnly = opts.lastmodDateOnly || false;
        this.level = (_a = opts.level) !== null && _a !== void 0 ? _a : types_1.ErrorLevel.WARN;
        this.xslUrl = opts.xslUrl;
    }
    writeHeadOutput() {
        this.hasHeadOutput = true;
        let stylesheet = '';
        if (this.xslUrl) {
            stylesheet = (0, sitemap_stream_1.stylesheetInclude)(this.xslUrl);
        }
        this.push(xmlDec + stylesheet + sitemapIndexTagStart);
    }
    _transform(item, encoding, callback) {
        if (!this.hasHeadOutput) {
            this.writeHeadOutput();
        }
        this.push((0, sitemap_xml_1.otag)(IndexTagNames.sitemap));
        if (typeof item === 'string') {
            this.push((0, sitemap_xml_1.element)(IndexTagNames.loc, item));
        }
        else {
            this.push((0, sitemap_xml_1.element)(IndexTagNames.loc, item.url));
            if (item.lastmod) {
                const lastmod = new Date(item.lastmod).toISOString();
                this.push((0, sitemap_xml_1.element)(IndexTagNames.lastmod, this.lastmodDateOnly ? lastmod.slice(0, 10) : lastmod));
            }
        }
        this.push((0, sitemap_xml_1.ctag)(IndexTagNames.sitemap));
        callback();
    }
    _flush(cb) {
        if (!this.hasHeadOutput) {
            this.writeHeadOutput();
        }
        this.push(closetag);
        cb();
    }
}
exports.SitemapIndexStream = SitemapIndexStream;
/**
 * `SitemapAndIndexStream` is a Transform stream that takes in sitemap items,
 * writes them to sitemap files, adds the sitemap files to a sitemap index,
 * and creates new sitemap files when the count limit is reached.
 *
 * It waits for the target stream of the current sitemap file to finish before
 * moving on to the next if the target stream is returned by the `getSitemapStream`
 * callback in the 3rd position of the tuple.
 *
 * ⚠️ CAUTION: This object is `readable` and must be read (e.g. piped to a file or to /dev/null)
 * before `finish` will be emitted. Failure to read the stream will result in hangs.
 *
 * @extends {SitemapIndexStream}
 */
class SitemapAndIndexStream extends SitemapIndexStream {
    /**
     * `SitemapAndIndexStream` is a Transform stream that takes in sitemap items,
     * writes them to sitemap files, adds the sitemap files to a sitemap index,
     * and creates new sitemap files when the count limit is reached.
     *
     * It waits for the target stream of the current sitemap file to finish before
     * moving on to the next if the target stream is returned by the `getSitemapStream`
     * callback in the 3rd position of the tuple.
     *
     * ⚠️ CAUTION: This object is `readable` and must be read (e.g. piped to a file or to /dev/null)
     * before `finish` will be emitted. Failure to read the stream will result in hangs.
     *
     * @param {SitemapAndIndexStreamOptions} opts - Stream options.
     */
    constructor(opts) {
        var _a;
        opts.objectMode = true;
        super(opts);
        this.itemsWritten = 0;
        this.getSitemapStream = opts.getSitemapStream;
        this.limit = (_a = opts.limit) !== null && _a !== void 0 ? _a : 45000;
    }
    _transform(item, encoding, callback) {
        if (this.itemsWritten % this.limit === 0) {
            if (this.currentSitemap) {
                const onFinish = new Promise((resolve, reject) => {
                    var _a, _b, _c;
                    (_a = this.currentSitemap) === null || _a === void 0 ? void 0 : _a.on('finish', resolve);
                    (_b = this.currentSitemap) === null || _b === void 0 ? void 0 : _b.on('error', reject);
                    (_c = this.currentSitemap) === null || _c === void 0 ? void 0 : _c.end();
                });
                const onPipelineFinish = this.currentSitemapPipeline
                    ? new Promise((resolve, reject) => {
                        var _a, _b;
                        (_a = this.currentSitemapPipeline) === null || _a === void 0 ? void 0 : _a.on('finish', resolve);
                        (_b = this.currentSitemapPipeline) === null || _b === void 0 ? void 0 : _b.on('error', reject);
                    })
                    : Promise.resolve();
                Promise.all([onFinish, onPipelineFinish])
                    .then(() => {
                    this.createSitemap(encoding);
                    this.writeItem(item, callback);
                })
                    .catch(callback);
                return;
            }
            else {
                this.createSitemap(encoding);
            }
        }
        this.writeItem(item, callback);
    }
    writeItem(item, callback) {
        if (!this.currentSitemap) {
            callback(new Error('No sitemap stream available'));
            return;
        }
        if (!this.currentSitemap.write(item)) {
            this.currentSitemap.once('drain', callback);
        }
        else {
            process.nextTick(callback);
        }
        // Increment the count of items written
        this.itemsWritten++;
    }
    /**
     * Called when the stream is finished.
     * If there is a current sitemap, we wait for it to finish before calling the callback.
     *
     * @param cb
     */
    _flush(cb) {
        const onFinish = new Promise((resolve, reject) => {
            if (this.currentSitemap) {
                this.currentSitemap.on('finish', resolve);
                this.currentSitemap.on('error', reject);
                this.currentSitemap.end();
            }
            else {
                resolve();
            }
        });
        const onPipelineFinish = new Promise((resolve, reject) => {
            if (this.currentSitemapPipeline) {
                this.currentSitemapPipeline.on('finish', resolve);
                this.currentSitemapPipeline.on('error', reject);
                // The pipeline (pipe target) will get it's end() call
                // from the sitemap stream ending.
            }
            else {
                resolve();
            }
        });
        Promise.all([onFinish, onPipelineFinish])
            .then(() => {
            super._flush(cb);
        })
            .catch((err) => {
            cb(err);
        });
    }
    createSitemap(encoding) {
        const [idxItem, currentSitemap, currentSitemapPipeline] = this.getSitemapStream(this.itemsWritten / this.limit);
        currentSitemap.on('error', (err) => this.emit('error', err));
        this.currentSitemap = currentSitemap;
        this.currentSitemapPipeline = currentSitemapPipeline;
        super._transform(idxItem, encoding, () => {
            // We are not too fussed about waiting for the index item to be written
            // we we'll wait for the file to finish at the end
            // and index file write volume tends to be small in comprarison to sitemap
            // writes.
            // noop
        });
    }
}
exports.SitemapAndIndexStream = SitemapAndIndexStream;
