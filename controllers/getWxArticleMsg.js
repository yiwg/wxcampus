var request = require("superagent");
var cheerio = require('cheerio');
var fs = require('fs');

exports.wxmsg = function (req, res, next) {
    var url = req.body.url;
    var currentres=res;
    console.log(url)
    if (url) {
        request.get(url) //获取人数
            .set({"Accept-Encoding": "gzip,sdch"}) //为了防止出现Zlib错误
            .end(function (res) {
                if (res.ok) {
                    console.log(res.text)
                    var start_msg_title = res.text.indexOf("var msg_title =");
                    var start_msg_desc = res.text.indexOf("var msg_desc =");
                    var start_msg_cdn_url = res.text.indexOf("var msg_cdn_url =");
                    var start_msg_link = res.text.indexOf("var msg_link =");
                    var start_user_uin = res.text.indexOf("var user_uin =");
                    var start_msg_source_url = res.text.indexOf("var msg_source_url =");
                    var start_img_format = res.text.indexOf("var img_format =");
                    var msg_title = res.text.substring(start_msg_title + "var msg_title =".length, start_msg_desc).trim()

                    var msg_desc = res.text.substring(start_msg_desc + "var msg_desc =".length, start_msg_cdn_url).trim()

                    var msg_cdn_url = res.text.substring(start_msg_cdn_url + "var msg_cdn_url =".length, start_msg_link).trim().replace("\"","").replace("\";","");

                    var msg_link = res.text.substring(start_msg_link + "var msg_link =".length, start_user_uin).trim().replace("\"","");

                    var msg_source_url = res.text.substring(start_msg_source_url + "var msg_source_url =".length, start_img_format).trim().replace("\"","").replace("'","").replace("';","");;
                    var $ = cheerio.load(res.text,{decodeEntities: false});

                    console.log( $('#js_content').html());

                    var stream = fs.createWriteStream('./cache' + 99 + '.jpg');

                    request.get(msg_cdn_url)
                        .set({"Accept-Encoding" : "gzip,sdch"})
                        .set('Accept','image/png,image/*;q=0.8,*/*;q=0.5')
                        .pipe(stream);

                        msg_desc = msg_desc.substring(1, msg_desc.length - 2);
                    currentres.render('back/configuration/wxmsgparseshow', {
                        url: url,
                        msg_title:/*$('#js_content').html()*/ msg_title.substring(1,msg_title.length-2),
                        msg_desc: msg_desc.replace("此为临时链接，仅用于文章预览，将在短期内失效关闭",""),
                        msg_cdn_url: msg_cdn_url,
                        msg_link: msg_link,
                        msg_source_url: msg_source_url,
                        msg_content: $('#js_content').html()
                    });

                } else {
                    currentres.send("地址错误");
                }

            });
    } else {
        res.send("地址错误");
    }
}
exports.wxmsgadd = function (req, res, next) {
    res.render('back/configuration/wxmsgparse');
}