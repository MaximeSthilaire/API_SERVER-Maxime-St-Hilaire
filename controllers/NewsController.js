const NewsRepository = require('../models/newsRepository');
module.exports = 
class NewsController extends require('./Controller') {
    constructor(req, res){
        super(req, res, false /* needAuthorization */);
        this.newsRepository = new NewsRepository(req, this.getQueryStringParams());
    }
    queryStringParamsList(){
        let content = "<div style=font-family:arial>";
        content += "<h4>List of parameters in query strings:</h4>";
        content += "<h4>? sort=key <br> return all images sorted by key values";
        content += "<h4>? sort=key,desc <br> return all images sorted by descending key values";
        content += "<h4>? key=value <br> return the image with key value = value";
        content += "<h4>? key=value* <br> return the image with key value that start with value";
        content += "<h4>? key=*value* <br> return the image with key value that contains value";
        content += "<h4>? key=*value <br> return the image with key value end with value";
        content += "<h4>page?limit=int&offset=int <br> return limit images of page offset";
        content += "</div>";
        return content;
    }
    queryStringHelp() {
        // expose all the possible query strings
        this.res.writeHead(200, {'content-type':'text/html'});
        this.res.end(this.queryStringParamsList());
    }
    head() {
        console.log("ETag: " + this.newsRepository.ETag);
        this.response.JSON(null, this.newsRepository.ETag);
    }
    get(id){
        // if we have no parameter, expose the list of possible query strings
        if (this.params === null) { 
            if(!isNaN(id)) {
                this.response.JSON(this.newsRepository.get(id));
            }
            else  
                this.response.JSON( this.newsRepository.getAll(), 
                                    this.newsRepository.ETag);
        }
        else {
            if (Object.keys(this.params).length === 0) /* ? only */{
                this.queryStringHelp();
            } else {
                this.response.JSON(this.newsRepository.getAll(), this.newsRepository.ETag);
            }
        }
    }
    post(news){  
        if (this.requestActionAuthorized()) {
            let newNews = this.newsRepository.add(news);
            if (newNews)
                this.response.created(newNews);
            else
                this.response.unprocessable();
        } else 
            this.response.unAuthorized();
    }
    put(news){
        if (this.requestActionAuthorized()) {
            if (this.newsRepository.update(news))
                this.response.ok();
            else
                this.response.unprocessable();
        } else
            this.response.unAuthorized();
    }
    remove(id){
        if (this.requestActionAuthorized()) {
            if (this.newsRepository.remove(id))
                this.response.accepted();
            else
                this.response.notFound();
        } else
            this.response.unAuthorized();
    }
}