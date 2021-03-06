var Photo_Guess = require('../proxy').Photo_Guess;
var Photo_Guess_Wgateid = require('../proxy').Photo_Guess_Wgateid;
var Question = require('../proxy').Question;
var School = require('../proxy').School;
var SchoolEx = require('../proxy').SchoolEx;
var Configuration = require('../proxy').Configuration;
var utility = require('utility');
var Util = require('../libs/util');
var config = require('../config').config;
var EventProxy = require('eventproxy');
var fs = require("fs");
var async = require('async');
var images = require("images");
var request = require('request');
var superagent = require("superagent");


exports.index = function (req, res, next) {
    var wgateid = req.query.wgateid;
    var sex = req.query.sex || "girl";
    var region_code = req.params.region_code;
    //region_code=region_code.substr(2,region_code.length);
    var start = req.params.start;
    //  start=start.substr(2,start.length);
    var end = req.params.end;
    //  end=end.substr(2,end.length);
    var sort = [
        [ 'create_at', 'desc' ]
    ];
    if (sex) {
        query = {sex: sex};
    }
    var options = {sort: sort};
    Configuration.getConfigurationByCode(start, function (err, start_cfg) {
        Configuration.getConfigurationByCode(end, function (err, end_cfg) {
            Photo_Guess.getPhoto_GuessByQuery({sex: sex, region_code: region_code, create_at: {
                "$gt": new Date(start_cfg.value),
                "$lt": new Date(end_cfg.value)
            }}, options, function (err, photo_guesss) {
                res.render('front/photo_guess/index', {photo_guesss: photo_guesss, wgateid: wgateid, sex: sex, region_code: region_code, start: start, end: end});
            })
        })
    })
}




exports.indexEx = function (req, res, next) {
    var page = parseInt(req.query.page, 10) || 1;
    var common=req.query.common;
    var all=req.query.all;
    page = page > 0 ? page : 1;
    var limit = 100;
    var sort = [
        [ 'create_at', 'desc' ]
    ];
    if(req.query.s){
        sort = [
            [ 'create_at', 'asc' ]
        ];
    }
    var options = { skip: (page - 1) * limit, limit: limit, sort: sort};
     Configuration.getConfigurationByCode("photo_guess", function (err, day) {
    if(!day){
        day=1;
    }
    day=day.value;
    Configuration.getConfigurationByCode(DateFormat(1), function (err, start_cfg) {
        Configuration.getConfigurationByCode(TodayFormat(), function (err, end_cfg) {
            var query = { type:"photo_guess",create_at: {
                "$gt": new Date(start_cfg.value),
                "$lt": new Date()
            }};
            if(common){
                query = {type:"photo_guess",region_code: req.query.region_code,range:1, create_at: {
                    "$gt": new Date(start_cfg.value),
                    "$lt": new Date(end_cfg.value)
                }};
            }
            if(all){
                console.log(req.query.all);
                query = {type:"photo_guess",region_code: req.query.region_code,create_at: {
                    "$gt": new Date(start_cfg.value)
                }};
            }
            var proxy = EventProxy.create('photo_guesss', 'pages',
                function (photo_guesss, pages) {
                    res.render('front/photo_guess/indexEx', {
                        photo_guesss: photo_guesss,
                        pages: pages,
                        current_page: page,
                        region_code: req.query.region_code,
                        asc:req.query.s
                    });
                });
            proxy.fail(next);
            Photo_Guess.getPhoto_GuessByQuery(query, options, function (err, photo_guesss) {
                photo_guesss.forEach(function (photo_guess, i) {
                    if (photo_guess) {
                        photo_guess.friendly_create_at = Util.format_date(photo_guess.create_at, true);
                        photo_guess.friendly_photo_url = '/public/front/photo_guess/' + photo_guess.create_at.getFullYear() + "" + (photo_guess.create_at.getMonth() + 1) + "" + photo_guess.create_at.getDate() + "/" + photo_guess._id + "welife" + ".jpg";
                    }
                    return photo_guesss;
                });
                proxy.emit('photo_guesss', photo_guesss);
            })

            Photo_Guess.getCountByQuery(query, proxy.done(function (all_count) {
                var pages = Math.ceil(all_count / limit);
                proxy.emit('pages', pages);
            }));
        })
    })
})
}



exports.indexEx = function (req, res, next) {
    var page = parseInt(req.query.page, 10) || 1;
    var common=req.query.common;
    var all=req.query.all;
    var type=req.query.type;

    if(!type){
        type="photo_guess";
}
    page = page > 0 ? page : 1;
    var limit = 100;
    var sort = [
        [ 'create_at', 'desc' ]
    ];
    if(req.query.s){
        sort = [
            [ 'create_at', 'asc' ]
        ];
    }
    var date=1;
    if(type=="photo_guess"){
        date=2;
    }
    var options = { skip: (page - 1) * limit, limit: limit, sort: sort};
     Configuration.getConfigurationByCode(type, function (err, day) {
    if(!day){
        day=1;
    }
    day=day.value;
    Configuration.getConfigurationByCode(DateFormat(day), function (err, start_cfg) {
        Configuration.getConfigurationByCode(TodayFormat(), function (err, end_cfg) {
            var query = { type:type,create_at: {
                "$gt": new Date(start_cfg.value),
                "$lt": new Date()
            }};
            if(common){
                query = {type:type,region_code: req.query.region_code,range:1, create_at: {
                    "$gt": new Date(start_cfg.value),
                    "$lt": new Date(end_cfg.value)
                }};
            }
            if(all){
                console.log(req.query.all);
                query = {type:type,region_code: req.query.region_code,create_at: {
                    "$gt": new Date(start_cfg.value)

                }};
            }
            var proxy = EventProxy.create('photo_guesss', 'pages',
                function (photo_guesss, pages) {
                    res.render('front/photo_guess/indexEx', {
                        photo_guesss: photo_guesss,
                        pages: pages,
                        current_page: page,
                        region_code: req.query.region_code,
                        type:type,
                        asc:req.query.s
                    });
                });
            proxy.fail(next);
            Photo_Guess.getPhoto_GuessByQuery(query, options, function (err, photo_guesss) {
                photo_guesss.forEach(function (photo_guess, i) {
                    if (photo_guess&&photo_guess._id) {
						console.log(photo_guess._id);
                        photo_guess.friendly_create_at = Util.format_date(photo_guess.create_at, true);
                        photo_guess.friendly_photo_url = '/public/front/photo_guess/' + photo_guess.create_at.getFullYear() + "" + (photo_guess.create_at.getMonth() + 1) + "" + photo_guess.create_at.getDate() + "/" + photo_guess._id + "welife" + ".jpg";
                        console.log(photo_guess.photo_url);
						 console.log(photo_guess.friendly_photo_url); 
					
					}
                    return photo_guesss;
                });
                proxy.emit('photo_guesss', photo_guesss);
            })

            Photo_Guess.getCountByQuery(query, proxy.done(function (all_count) {
                var pages = Math.ceil(all_count / limit);
                proxy.emit('pages', pages);
            }));
        })
    })
})
}

exports.back_index = function (req, res, next) {
    var page = parseInt(req.query.page, 10) || 1;
    var common=req.query.common;
	var must_answer=req.query.must_answer;
    var all=req.query.all;
    var kw=req.query.kw;
    var en_name=req.query.en_name;
    page = page > 0 ? page : 1;
    var limit = 100;
    var sort = [
        [ 'create_at', 'desc' ]
    ];
    var type=req.query.type||"photo_guess";
    var options = { skip: (page - 1) * limit, limit: limit, sort: sort};
    var number=1;
    if(type=="photo_guess"){
        number=1;
    }
    Configuration.getConfigurationByCode(type, function (err, day) {
    if(!day){
        day=1;
    }
    day=day.value;
    Configuration.getConfigurationByCode(DateFormat(day), function (err, start_cfg) {
        Configuration.getConfigurationByCode(TodayFormat(), function (err, end_cfg) {
            console.log("----11")
            var query = {region_code: req.query.region_code,type:type, create_at: {
                "$gt": new Date(start_cfg.value),
                "$lt": new Date(end_cfg.value)
            }};
            if( !req.query.region_code){
                query = {type:type, create_at: {
                    "$gt": new Date(start_cfg.value),
                    "$lt": new Date(end_cfg.value)
                }};
            }
            if(common&&(common!='undefined')){

                if( req.query.region_code){
                    query = {region_code: req.query.region_code,range:1,type:type, create_at: {
                        "$gt": new Date(start_cfg.value),
                        "$lt": new Date(end_cfg.value)
                    }};
                }else{
                    query = {range:1,type:type, create_at: {
                        "$gt": new Date(start_cfg.value),
                        "$lt": new Date(end_cfg.value)
                    }};

                }
            }
			if(must_answer&&(must_answer!='undefined')){

                if( req.query.region_code){
                    query = {region_code: req.query.region_code,must_anwser:true,type:type, create_at: {
                        "$gt": new Date(start_cfg.value),
                        "$lt": new Date(end_cfg.value)
                    }};
                }else{
                    query = {must_anwser:true,type:type, create_at: {
                        "$gt": new Date(start_cfg.value),
                        "$lt": new Date(end_cfg.value)
                    }};
                }
            }
            if(all||(!end_cfg)){
                if( req.query.region_code){
                    query = {region_code: req.query.region_code,type:type,create_at: {
                        "$gt": new Date(start_cfg.value)

                    }};
                }else{
                    query = {type:type,create_at: {
                        "$gt": new Date(start_cfg.value)

                    }};
                }

            }
            if(kw) {
                query = {"$or": [
                    {wx_account: new RegExp('^' + kw + '$', "i")},
                    {"introduction": new RegExp('^' + kw + '$', "i")}
                ], type:type, create_at: {

                    "$gt": new Date(start_cfg.value),
                    "$lt": new Date(end_cfg.value)
                }};
            }

            if(en_name){
                query = {en_name: en_name,type:type, create_at: {
                    "$gt": new Date(start_cfg.value),
                    "$lt": new Date(end_cfg.value)
                }};
            }
            var temp="back/"+type+"/index";
            /*var proxy = EventProxy.create('photo_guesss',
                function (photo_guesss) {
                    console.log("---------------------")
                    res.render(temp, {
                        photo_guesss: photo_guesss,
                        pages: 10,
                        current_page: page,
                        region_code: req.query.region_code,
							common:common,
							must_answer:must_answer
                    });
                });
            proxy.fail(next);*/
            Photo_Guess.getPhoto_GuessByQuery(query, options, function (err, photo_guesss) {
               console.log("----items")
                Photo_Guess.getCountByQuery(query,function (all_count) {
                    console.log("----count")

                    photo_guesss.forEach(function (photo_guess, i) {

                        if (photo_guess) {
                            photo_guess.friendly_create_at = Util.format_date(photo_guess.create_at, true);

                            photo_guess.friendly_photo_url = '/public/front/photo_guess/' + photo_guess.create_at.getFullYear() + "" + (photo_guess.create_at.getMonth() + 1) + "" + photo_guess.create_at.getDate() + "/" + photo_guess._id + "welife" + ".jpg";

                        }
                        return photo_guesss;
                    });
                    var pages = Math.ceil(all_count / limit);
                    console.log("----redent")

                    res.render(temp, {
                        photo_guesss: photo_guesss,
                        pages: pages,
                        current_page: page,
                        region_code: req.query.region_code,
                        common:common,
                        must_answer:must_answer
                    });
                });
               /* proxy.emit('photo_guesss', photo_guesss);*/
            })

          /*  Photo_Guess.getCountByQuery(query, proxy.done(function (all_count) {
                console.log("--------------------22-")
                var pages = Math.ceil(all_count / limit);
                proxy.emit('pages', pages);
            }));*/
        })
    })
})
}

var download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

exports.genertor_images = function (req, res, next) {
    var filePath = config.photo_dir;
    Configuration.getConfigurationByCode(DateFormat(2), function (err, start_cfg) {
        Configuration.getConfigurationByCode(TodayFormat(), function (err, end_cfg) {
            var query = {create_at: {
                "$gt": new Date(start_cfg.value),
                "$lt": new Date(end_cfg.value)
            }};
            Photo_Guess.getPhoto_GuessByQuery(query, {}, function (err, photo_guesss) {
                console.log(photo_guesss.length);
                async.eachSeries(photo_guesss, function (photo_guess, callback) {
                    merge_image(photo_guess, "right",callback);
                    //callback(); // Alternatively: callback(new Error());
                }, function (err) {
                    if (err) {
                        return res.send({success: false});
                        throw err;
                    } else {
                        return res.send({success: true});
                    }
                });
            });
        })
    })
}

//合并图片
function merge_image(photo_guess, direction,callback) {
    if(!photo_guess.must_anwser){
        callback();
        return;
    }
    console.log(direction);
    var data = photo_guess.create_at;
    var x = 0;
    var y = 0;
    if (direction == "right") {
        x = 255;
    }
    var url = "";
    superagent
        .post('dwz.cn/create.php')
        .send('url=http://www.weixingate.com/gate.php?back=http://welife001.com/pd/'+photo_guess._id+'')
        .set('X-API-Key', 'foobar')
        .set('Accept', 'application/json')
        .end(function (res) {
            if (res.ok) {
                var indexHead = res.text.indexOf("tinyurl");
                var indexTail = res.text.indexOf("status");
                var url = res.text.slice(indexHead, indexTail).trim();
                url = url.substring('tinyurl:'.length + 2, url.length - 3).replace(/\\/g, '');
                console.log(url);
                console.log(photo_guess._id);
                var filePath =config.photo_dir+ data.getFullYear() + "" + (data.getMonth() + 1) + "" + data.getDate() + "/";
                download("http://s.jiathis.com/qrcode.php?url="+url, 'google.png', function () {
                    images(filePath + photo_guess._id + ".jpg")                     //Load image from file
                        //加载图像文件
                        .size(400)                          //Geometric scaling the image to 400 pixels width
                        //等比缩放图像到400像素宽
                        .draw(images("google.png").size(145), x, y)   //Drawn logo at coordinates (10,10)
                        //在(10,10)处绘制Logo
                        .save(filePath + photo_guess._id + "welife" + ".jpg", {               //Save the image to a file,whih quality 50
                            quality:90                    //保存图片到文件,图片质量为50
                        });
                    if(callback){
                        callback();
                    }
                });
            } else {
                console.log('Oh no! error ' + res.text);
            }
        });
}
exports.upload = function (req, res, next) {
    res.render('back/photo_guess/upload');
}

exports.barcode_result = function (req, res, next) {
    res.render('back/photo_guess/barcode_result');
}

exports.merge_one_image = function (req, res, next) {
    var id = req.query.id;
    var direction = req.query.direction;
    Photo_Guess.getPhoto_GuessById(id, function (err, photo_guess) {
        merge_image(photo_guess, direction)
        return res.send({success: true});
    })
}

exports.test = function (req, res, next) {

}




exports.show_create = function (req, res, next) {
    var en_school = req.params.en_school;
    console.log(en_school);
    var sort = [
        [ 'weight', 'desc' ]
    ];

    Question.getQuestionByQuery({status:true},  {sort: sort}, function (err, questions) {
        console.log(questions);
        School.getSchoolByEname(en_school, function (err, school) {
            res.render('front/photo_guess/create', {questions: questions, school: school});
        })
    })
}




exports.show_createzipai = function (req, res, next) {
    var en_school = req.params.en_school;
        School.getSchoolByEname(en_school, function (err, school) {
            res.render('front/zipai/create', { school: school});
        })

}

exports.show_result = function (req, res, next) {
    var type=req.query.type;
    if(!type){
        type="photo_guess"
    }
    School.getSchoolsByQuery({region_code: req.query.region_code}, {}, function (err, schools) {
        res.render("back/"+type+"/result", {schools: schools});
    })
}

exports.handler = function (req, res, next) {
    Photo_Guess.getPhoto_GuessById(req.query.id, function (err, photo_guess) {
        var type=req.query.type;
        if(type=="pass"){
            photo_guess.pass=false;
            photo_guess.save();
        }else if(type=="del"){
            photo_guess.pass=false;
            photo_guess.save();
        }else if(type=="range0"){
            photo_guess.range=0;
            photo_guess.save();
        }else if(type=="range1"){
			photo_guess.range=1;
            photo_guess.save();
		}else if(type=="transform"){
            photo_guess.transform=req.query.transform;
            photo_guess.save();
        }else if(type=="title"){
            SchoolEx.getSchoolByEname(photo_guess.en_name,function(err,school){
                school.photo_guess_title=photo_guess.introduction;
                school.save();
            })
        }
        return res.send({ success: true });
    });
}
exports.del = function (req, res, next) {
    Photo_Guess.removeById(req.query.id, function (err, regions) {
        return  res.redirect("front/photo_guess/index");
    })
}
exports.detail = function (req, res, next) {
    var index = 0;
    var wgateid = req.query.wgateid;
    console.log("wgateid+" + wgateid);
    var photo_guess_id = req.params.id;
    console.log(photo_guess_id);
    Photo_Guess.getPhoto_GuessById(photo_guess_id, function (err, photo_guess) {
        if (err||(!photo_guess)) {
            return res.send({ success: false, message: '发生错误。' });
        }
        console.log(photo_guess);
        if(!photo_guess.must_anwser){
           return res.send({msg:"这个不需要答题"});
        }
        photo_guess.friendly_photo_url = '/public/front/photo_guess/' + photo_guess.create_at.getFullYear() + "" + (photo_guess.create_at.getMonth() + 1) + "" + photo_guess.create_at.getDate() + "/" + photo_guess._id + "welife" + ".jpg";
        async.eachSeries(photo_guess.questions, function (question_value, callback) {
            console.log(question_value);
            var temp;
            Question.getQuestionById(question_value.q_id, function (err, question) {
                // console.log(photo_guess.questions[index].question.length)
                while (question.answers.length > 3) {
                    temp = question.answers.splice(GetRandomNum(0, question.answers.length), 1);
                }
                //选项和答案相同的情况下
                for (var i = 0; i < 3; i++) {
                    console.log(question.answers[i].content + question_value.value);
                    if (question.answers[i].content == question_value.value) {
                        question.answers.splice(i, 1);
                        question.answers.push(temp[0]);
                    }
                }
                photo_guess.questions[index].question = question;
                index++;
                callback(); // Alternatively: callback(new Error());
            })
        }, function (err) {
            if (err) {
                throw err;
            }
            console.log(photo_guess.wx_already_open_count);
            console.log(photo_guess.guess_count);
            if((!photo_guess.wx_already_open_count)||photo_guess.wx_already_open_count==0){
                photo_guess.wx_already_open_count=1;
            }
            if((!photo_guess.guess_count)||photo_guess.guess_count==0){
                photo_guess.guess_count=1;
            }
            photo_guess.guess_count+= parseInt(10 * Math.random());
            var rate=Math.round(photo_guess.wx_already_open_count/photo_guess.guess_count*100);
            console.log(rate);
            Photo_Guess_Wgateid.getCountBywgateid(photo_guess_id, wgateid, function (err, photo_guess_wgateid) {
                return  res.render("front/photo_guess/detail", {photo_guess: photo_guess, photo_guess_wgateid: photo_guess_wgateid, wgateid: wgateid,rate:rate});
                // })
            })
        });
    })
}

function GetRandomNum(Min, Max) {
    var Range = Max - Min;
    var Rand = Math.random();
    var result = (Min + Math.round(Rand * Range));
    if (result < 0) {
        result = -result;
    }
    return result;
}


exports.up_answer = function (req, res, next) {
    var photo_guess_id = req.body.photo_guess_id;
    var question0_value = req.body.question1_value;
    var question1_value = req.body.question2_value;
    var wgateid = req.body.wgateid;
    var result = false;
    ;
    Photo_Guess.getPhoto_GuessById(photo_guess_id, function (err, photo_guess) {
        if (err||(!photo_guess)) {
            return res.send({ success: false, message: '发生错误。' });
        }
        if ((!photo_guess.questions[0].value)||(!photo_guess.questions[1].value)) {
            return res.send({ success: false, message: '发生错误。' });
        }
        if ((photo_guess.questions[0].value.trim() == question0_value.trim()) && (photo_guess.questions[1].value.trim() == question1_value.trim())) {
            photo_guess.wx_already_open_count++;
            result = true;
            //return res.send({ success: true, message:photo_guess.wx_account});
        }else{
            photo_guess.guess_count++;
        }
        Photo_Guess_Wgateid.newAndSave(photo_guess_id, wgateid, result, function () {
            photo_guess.save();
            return res.send({ success: result });
        });
    });
}


///提交内容
exports.create = function (req, res, next) {
    var photo_url = req.body.photo_url;
    var question1 = req.body.question1;
    var question1_answer = req.body.question1_answer;
    var question2 = req.body.question2;
    var question2_answer = req.body.question2_answer;
    var en_name = req.body.en_name;
    var cn_name = req.body.cn_name;
    var wx_account = req.body.wx_account;
    var wx_open_count = 0;
    var introduction = req.body.introduction;
    var nickname = req.body.nickname;
    var sex = req.body.sex;
    var region_code = req.body.region_code;
    var must_anwser = req.body.must_anwser;
    var range = req.body.range;
    var source=req.body.source;
    var grade=req.body.grade;
    var hometown=req.body.hometown;
    var recommand_name=req.body.recommand_name;
    var major=req.body.major;
    var demand=req.body.demand;
    if (must_anwser == "1") {
        must_anwser = false;
    } else {
        must_anwser = true;
    }
    if (photo_url) {
        var base64Data = photo_url.replace(/^data:image\/\w+;base64,/, "");
        var dataBuffer = new Buffer(base64Data, 'base64');
        var dirctory = "public/front/photo_guess/" + (new Date()).getFullYear() + ((new Date()).getMonth() + 1) + (new Date()).getDate() + "";
        if (!fs.existsSync(dirctory)) {
            fs.mkdirSync(dirctory);
        }
        var oldpath = dirctory + "/" + guid() + ".jpg"
        fs.writeFile(oldpath, dataBuffer, function (err) {
            if (err) {
                console.log(err);
                return  res.send(err);
            }
            Photo_Guess.newAndSave(photo_url, [
                {q_id: question1, value: question1_answer, show_index: GetRandomNum(0, 2)},
                {q_id: question2, value: question2_answer, show_index: GetRandomNum(0, 2)}
            ], nickname, sex, cn_name, en_name, introduction, wx_account, wx_open_count, region_code, range, must_anwser,source,grade,hometown,"photo_guess","",recommand_name,major,demand,function (err, photo_guess) {
                if (err) {
                    console.log(err);
                }
                var photo_guess_id = guid();
                photo_guess_id = photo_guess._id
                fs.rename(oldpath, dirctory + "/" + photo_guess_id + ".jpg", function (err) {
                    photo_guess.photo_url = "/" + dirctory + "/" + photo_guess_id + ".jpg";
                    photo_guess.save();
                    return    res.render("front/photo_guess/result");
                });
            })
        })
    }
}

function TodayFormat() {
    var today = new Date(); // 获取今天时间
    return today.getFullYear() + "" + (today.getMonth() + 1) + "" + today.getDate();
}
function YesTodayFormat() {
    var today = new Date(); // 获取今天时间
    today.setDate(today.getDate() - 1); // 系统会自动转换
    return today.getFullYear() + "" + (today.getMonth() + 1) + "" + today.getDate();
}

function DateFormat(number) {
    var today = new Date(); // 获取今天时间
    today.setDate(today.getDate() - number); // 系统会自动转换
    return today.getFullYear() + "" + (today.getMonth() + 1) + "" + today.getDate();
}

///生成结果
exports.result_photo_guess = function (req, res, next) {
    var en_name = req.body.en_name;
    var type = req.body.type;
    if(!type){
        type="photo_guess";
    }
    var region_code = req.body.region_code;
    /*var templete_yschool_ = "<blockquote style='margin: 0.2em; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; border-top-width: 3px; border-right-width: 3px; border-bottom-width: 3px; border-top-style: solid; border-right-style: solid; border-bottom-style: solid; border-color: rgb(201, 201, 201); white-space: normal; max-width: 100%; color: rgb(62, 62, 62); font-size: 15px; line-height: 24px; font-family: 宋体; -webkit-box-shadow: rgb(170, 170, 170) 0px 0px 10px; box-shadow: rgb(170, 170, 170) 0px 0px 10px; text-align: center; box-sizing: border-box !important; word-wrap: break-word !important; background-color: rgb(255, 255, 255);'>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; box-sizing: border-box !important;'><br></p>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; box-sizing: border-box !important;'>" +
        "<img data-s='300,640' data-type='jpeg' data-src='#photo_guess_url#' data-ratio='1.0020366598778003' data-w='491' style='-moz-transform:rotate(#transform#deg); -webkit-transform:rotate(#transform#deg);transform:rotate(#transform#deg);margin: 0px; padding: 0px; box-sizing: border-box !important; word-wrap: break-word !important; visibility: visible !important; width: auto !important; height: auto !important;' _width='auto' src='#photo_guess_url#'>#br#</p>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>所在学校：</strong></span><span style='color: rgb(89, 89, 89);'>#school#</span></p>" +
                "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>所学专业：</strong></span><span style='color: rgb(89, 89, 89);'>#zhuanye#</span></p>" +

        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>缘分类型：</strong></span><span style='color: rgb(89, 89, 89);'>#source#</span></p>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>#introducetype#：</strong></span><span style='color: rgb(89, 89, 89);'>#introduce#</span></p>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>微信号：</strong></span><span style='color: rgb(89, 89, 89);'>#wxaccount#</span></p>"


    var templete_nschool = "<blockquote style='margin: 0.2em; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; border-top-width: 3px; border-right-width: 3px; border-bottom-width: 3px; border-top-style: solid; border-right-style: solid; border-bottom-style: solid; border-color: rgb(201, 201, 201); white-space: normal; max-width: 100%; color: rgb(62, 62, 62); font-size: 15px; line-height: 24px; font-family: 宋体; -webkit-box-shadow: rgb(170, 170, 170) 0px 0px 10px; box-shadow: rgb(170, 170, 170) 0px 0px 10px; text-align: center; box-sizing: border-box !important; word-wrap: break-word !important; background-color: rgb(255, 255, 255);'>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; box-sizing: border-box !important;'><br></p><p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; box-sizing: border-box !important;'>" +
        "<img data-s='300,640' data-type='jpeg' data-src='#photo_guess_url#' data-ratio='1.0020366598778003' data-w='491' style='-moz-transform:rotate(#transform#deg); -webkit-transform:rotate(#transform#deg);transform:rotate(#transform#deg);margin: 0px; padding: 0px; box-sizing: border-box !important; word-wrap: break-word !important; visibility: visible !important; width: auto !important; height: auto !important;' _width='auto' src='#photo_guess_url#'>#br#</p>" +
            "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>所学专业：</strong></span><span style='color: rgb(89, 89, 89);'>#zhuanye#</span></p>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>缘分类型：</strong></span><span style='color: rgb(89, 89, 89);'>#source#</span></p>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>#introducetype#：</strong></span><span style='color: rgb(89, 89, 89);'>#introduce#</span></p>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>微信号：</strong></span><span style='color: rgb(89, 89, 89);'>#wxaccount#</span></p>"


   if(type=="zipai"){
        templete_yschool_ = "<blockquote style='margin: 0.2em; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; border-top-width: 3px; border-right-width: 3px; border-bottom-width: 3px; border-top-style: solid; border-right-style: solid; border-bottom-style: solid; border-color: rgb(201, 201, 201); white-space: normal; max-width: 100%; color: rgb(62, 62, 62); font-size: 15px; line-height: 24px; font-family: 宋体; -webkit-box-shadow: rgb(170, 170, 170) 0px 0px 10px; box-shadow: rgb(170, 170, 170) 0px 0px 10px; text-align: center; box-sizing: border-box !important; word-wrap: break-word !important; background-color: rgb(255, 255, 255);'>" +
           "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; box-sizing: border-box !important;'><br></p>" +
           "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; box-sizing: border-box !important;'>" +
           "<img data-s='300,640' data-type='jpeg' data-src='#photo_guess_url#' data-ratio='1.0020366598778003' data-w='491' style='-moz-transform:rotate(#transform#deg); -webkit-transform:rotate(#transform#deg);transform:rotate(#transform#deg);margin: 0px; padding: 0px; box-sizing: border-box !important; word-wrap: break-word !important; visibility: visible !important; width: auto !important; height: auto !important;' _width='auto' src='#photo_guess_url#'>#br#</p>" +
           "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>所在学校：</strong></span><span style='color: rgb(89, 89, 89);'>#school#</span></p>" +
           "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>所学专业：</strong></span><span style='color: rgb(89, 89, 89);'>#zhuanye#</span></p>" +
           "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>图片说：</strong></span><span style='color: rgb(89, 89, 89);'>#introduce#</span></p>" +
           "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>昵称：</strong></span><span style='color: rgb(89, 89, 89);'>#nickname#</span></p>"



        templete_nschool = "<blockquote style='margin: 0.2em; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; border-top-width: 3px; border-right-width: 3px; border-bottom-width: 3px; border-top-style: solid; border-right-style: solid; border-bottom-style: solid; border-color: rgb(201, 201, 201); white-space: normal; max-width: 100%; color: rgb(62, 62, 62); font-size: 15px; line-height: 24px; font-family: 宋体; -webkit-box-shadow: rgb(170, 170, 170) 0px 0px 10px; box-shadow: rgb(170, 170, 170) 0px 0px 10px; text-align: center; box-sizing: border-box !important; word-wrap: break-word !important; background-color: rgb(255, 255, 255);'>" +
           "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; box-sizing: border-box !important;'><br></p><p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; box-sizing: border-box !important;'>" +
           "<img data-s='300,640' data-type='jpeg' data-src='#photo_guess_url#' data-ratio='1.0020366598778003' data-w='491' style='-moz-transform:rotate(#transform#deg); -webkit-transform:rotate(#transform#deg);transform:rotate(#transform#deg);margin: 0px; padding: 0px; box-sizing: border-box !important; word-wrap: break-word !important; visibility: visible !important; width: auto !important; height: auto !important;' _width='auto' src='#photo_guess_url#'>#br#</p>" +
           "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>所学专业：</strong></span><span style='color: rgb(89, 89, 89);'>#zhuanye#</span></p>" +
           "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>图片说：</strong></span><span style='color: rgb(89, 89, 89);'>#introduce#</span></p>" +
           "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>昵称：</strong></span><span style='color: rgb(89, 89, 89);'>#nickname#</span></p>"

   }*/
    var result = "";
    var sort = [
        [ 'create_at', 'desc' ]
    ];
    var index = 1;
    var cn_title;
    var options = { sort: sort};

    Configuration.getConfigurationByCode(type+"_model", function (err, model1) {
        Configuration.getConfigurationByCode(model1.value, function (err, model) {
            Configuration.getConfigurationByCode(type, function (err, day) {
                Configuration.getConfigurationByCode(DateFormat(day.value), function (err, start_cfg) {
                    Configuration.getConfigurationByCode(TodayFormat(), function (err, end_cfg) {
                        Photo_Guess.getPhoto_GuessByQuery({en_name: en_name, type: type, pass: true, create_at: {
                            "$gt": new Date(start_cfg.value),
                            "$lt": new Date(end_cfg.value)
                        }}, options, function (err, photo_guesses) {
                            //第一步，如果小于4个人
                            console.log("---" + photo_guesses.length);
                            if (photo_guesses.length < 5) {
                                photo_guesses.forEach(function (photo_guess, i) {
                                    if (photo_guess) {
                                        result += replaceEx(model, photo_guess, true);
                                    }
                                });
                                //同时从本市其他高校中拿出一部分来
                                Photo_Guess.getPhoto_GuessByQuery({region_code: region_code, en_name: {$ne: en_name}, pass: true, type: type, range: 1, create_at: {
                                    "$gt": new Date(start_cfg.value),
                                    "$lt": new Date(end_cfg.value)
                                }}, options, function (err, photo_guesses) {
                                    var number = photo_guesses.length > 10 ? 10 : photo_guesses.length;
                                    while (number > 0) {
                                        var random = parseInt((photo_guesses.length - 1) * Math.random());
                                        result += replaceEx(model, photo_guesses[random], true);
                                        photo_guesses.splice(random, 1);
                                        number--;
                                    }
                                    SchoolEx.getSchoolByEname(en_name, function (err, school) {
                                        if (type == "zipai") {
                                            school.zipai_content = result;
                                        } else {
                                            school.photo_guess_content = result;
                                        }

                                        school.save();
                                        return res.json({ success: true});
                                    })
                                });
                            } else {
                                console.log(photo_guesses.length);
                                //result += "<p></p><p><span style='color: rgb(247, 150, 70);font-size:20px'><strong>本校信息</strong></span></p><p></p>";
                                photo_guesses.forEach(function (photo_guess, i) {
                                    if (photo_guess) {
                                        result += replaceEx(model, photo_guess, false);
                                    }
                                });
                                SchoolEx.getSchoolByEname(en_name, function (err, school) {
                                    if (type == "zipai") {
                                        school.zipai_content = result;
                                    } else {
                                        school.photo_guess_content = result;
                                    }
                                    school.save();
                                    return res.json({ success: true});
                                })
                                //result += "<p></p><p><span style='color: rgb(247, 150, 70);font-size:20px'><strong>周边高校</strong></span></p><p></p>";

                                //同时从本市其他高校中拿出一部分来
                                /*Photo_Guess.getPhoto_GuessByQuery({region_code: region_code,en_name: {$ne: en_name},pass:true, range: 1,type:"photo_guess",create_at: {
                                 "$gt": new Date(start_cfg.value),
                                 "$lt": new Date(end_cfg.value)
                                 }}, options, function (err, photo_guesses) {
                                 var number = photo_guesses.length > 12 ? 12 : photo_guesses.length;
                                 while (number > 0) {
                                 var random = parseInt((photo_guesses.length - 1) * Math.random());
                                 result +=replaceEx( templete_yschool_, photo_guesses[random])
                                 photo_guesses.splice(random, 1);
                                 number--;
                                 }
                                 SchoolEx.getSchoolByEname(en_name, function (err, school) {
                                 school.photo_guess_content = result;
                                 school.save();
                                 return res.json({ success: true});
                                 })
                                 });*/
                            }
                        })
                    });
                });
            });
        });
    });
    }

    function replaceEx(model,photo_guess,has_school){
        var temp=model.value;
        console.log(photo_guess)

       temp=temp.replace("$wx_photo_url$", photo_guess.wx_photo_url)
            .replace("$wx_photo_url$", photo_guess.wx_photo_url)
            .replace("$cn_name$", photo_guess.cn_name)
            .replace("$introduction$", photo_guess.introduction)
            .replace("$major$", photo_guess.major)
            .replace("$introductiontype$", photo_guess.source=="ziji"?"个人介绍":'室友印象')
            .replace("$photo_guess_type$",  photo_guess.source=="ziji"?"帮自己找缘分":'替室友找缘分')
           .replace("$hometown_type$",  photo_guess.source=="ziji"?"自己家乡":'室友家乡')
           .replace("$hometown$",  photo_guess.hometown)
            .replace("$nickname$",  photo_guess.nickname)
           .replace("$grade$",  photo_guess.grade)
            .replace("$wxaccount$",photo_guess.wx_account);
            if(has_school){
                temp=temp.replace("$display$","")
            }else{
                temp=temp.replace("$display$","display:none")
            }
        if(!photo_guess.transform){
            temp=temp.replace("$transform$", photo_guess.transform)
        }else{
            temp=temp.replace("$transform$",0)
        }
        temp=temp+"<section style='box-sizing: border-box; background-color: rgb(255, 255, 255);'><section class='Powered-by-XIUMI V5' style='position: static; box-sizing: border-box;'><section class='' style='margin: 0.5em 0px; position: static; box-sizing: border-box;'><section style='border-top-style: dashed; border-top-width: 1px; border-top-color: rgb(249, 110, 87); box-sizing: border-box;' class=''></section></section></section></section>"
        console.log(temp)
        console.log(photo_guess)
        return temp;
    }

        /*var result="";
        console.log(photo_guess)
        var single_tem="<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>#title#：</strong></span><span style='color: rgb(89, 89, 89);'>#content#</span></p>"
       result += temp.replace(/#photo_guess_url#/g, photo_guess.wx_photo_url)
            .replace(/#school#/g, photo_guess.cn_name)
            .replace(/#introduce#/g, photo_guess.introduction)
             .replace(/#zhuanye#/g, photo_guess.major)
            .replace(/#introducetype#/g, photo_guess.source=="ziji"?"个人介绍":'室友印象')
            .replace(/#source#/g,  photo_guess.source=="ziji"?"帮自己找缘分":'替室友找缘分')
            .replace(/#nickname#/g,  photo_guess.nickname);
        if(photo_guess.grade){
            result += single_tem.replace(/#title#/g,"所在年级").replace(/#content#/g,photo_guess.grade);
        }
        if(photo_guess.hometown){
            result += single_tem.replace(/#title#/g, photo_guess.source=="ziji"?"自己家乡":'室友家乡').replace(/#content#/g,photo_guess.hometown);
        }
        if(photo_guess.must_anwser){
            result =result.replace(/#wxaccount#/g, "<span style='font-size:12px;color:#808080'>长摁图片识别二维码进行答题获取</span>")
        }else{
            result =result.replace(/#wxaccount#/g,photo_guess.wx_account)
        }
        if(!photo_guess.transform){
            photo_guess.transform=0;
        }
        if(photo_guess.transform>0){
            result =result.replace(/#br#/g,"<p style='height:50px'>");
        }
        result =result.replace(/#br#/g,"");
        result =result.replace(/#transform#/g,photo_guess.transform);
        if(type=="zipai"){
            result += "</blockquote><p></p>"
        }
        else{
            result += "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>备注：</strong></span><span style='color: rgb(89, 89, 89);'><span style='font-size:12px;color:#808080'>加对方好友验证时请简单的介绍一下自己,对方加不加就看缘分啦</span></span></p> </blockquote><p></p>"

        }*/
        // return result


function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}



exports.show_create_ershou = function (req, res, next) {
    var en_school = req.params.en_school;
      School.getSchoolByEname(en_school, function (err, school) {
            res.render('front/ershou/create', {school: school});
        })
 
}

exports.show_create_complain = function (req, res, next) {
    var en_school = req.params.en_school;
    School.getSchoolByEname(en_school, function (err, school) {
        res.render('front/complain/create', {school: school});
    })

}




///提交二手
exports.create_complain = function (req, res, next) {
    var photo_url = req.body.photo_url;
    var en_name = req.body.en_name;
    var cn_name = req.body.cn_name;
    var wx_account = req.body.wx_account;
    var introduction = req.body.introduction;
    var region_code = req.body.region_code;
    var source = req.body.source;
    if (photo_url) {
        var base64Data = photo_url.replace(/^data:image\/\w+;base64,/, "");
        var dataBuffer = new Buffer(base64Data, 'base64');
        var dirctory = "public/front/photo_guess/" + (new Date()).getFullYear() + ((new Date()).getMonth() + 1) + (new Date()).getDate() + "";
        if (!fs.existsSync(dirctory)) {
            fs.mkdirSync(dirctory);
        }
        var oldpath = dirctory + "/" + guid() + ".jpg"
        fs.writeFile(oldpath, dataBuffer, function (err) {
            if (err) {
                console.log(err);
                return  res.send(err);
            }
            Photo_Guess.newAndSave(photo_url,"", "", "", cn_name, en_name, introduction, wx_account,0, region_code, "",false,source,"","","complain","","","","",function (err, photo_guess) {
                if (err) {
                    console.log(err);
                }
                var photo_guess_id = guid();
                photo_guess_id = photo_guess._id
                fs.rename(oldpath, dirctory + "/" + photo_guess_id + ".jpg", function (err) {
                    photo_guess.photo_url = "/" + dirctory + "/" + photo_guess_id + ".jpg";
                    photo_guess.save();
                    return   res.render("front/complain/result");
                });
            })
        })
    }else{
        Photo_Guess.newAndSave(photo_url,"", "", "", cn_name, en_name, introduction, wx_account,0, region_code, range,false,source,"","","complain","","","","",function (err, photo_guess) {
            if (err) {
                console.log(err);
                return;
            }
            return   res.render("front/complain/result");

        })
    }
}



///提交二手
exports.create_ershou = function (req, res, next) {
    var photo_url = req.body.photo_url;
    var en_name = req.body.en_name;
    var cn_name = req.body.cn_name;
    var wx_account = req.body.wx_account;
    var introduction = req.body.introduction;
    var region_code = req.body.region_code;
    var range = req.body.range;
    var source=req.body.source;
    var price=req.body.price;

    if (photo_url) {
        var base64Data = photo_url.replace(/^data:image\/\w+;base64,/, "");
        var dataBuffer = new Buffer(base64Data, 'base64');
        var dirctory = "public/front/photo_guess/" + (new Date()).getFullYear() + ((new Date()).getMonth() + 1) + (new Date()).getDate() + "";
        if (!fs.existsSync(dirctory)) {
            fs.mkdirSync(dirctory);
        }
        var oldpath = dirctory + "/" + guid() + ".jpg"
        fs.writeFile(oldpath, dataBuffer, function (err) {
            if (err) {
                console.log(err);
                return  res.send(err);
            }
			console.log("baocmintup");
			//exports.newAndSave = function (photo_url,questions,nickname,sex,cn_name,en_name,introduction,wx_account,wx_open_count,region_code,range,must_anwser,source,grade,hometown,type,price,recommand_name,major,demand,callback) {

            Photo_Guess.newAndSave(photo_url,"", "", "", cn_name, en_name, introduction, wx_account,0, region_code, range,false,source,"","","ershou",price,"","","",function (err, photo_guess) {
                if (err) {
                    console.log(err);
                }
                var photo_guess_id = guid();
                photo_guess_id = photo_guess._id
                fs.rename(oldpath, dirctory + "/" + photo_guess_id + ".jpg", function (err) {
                    photo_guess.photo_url = "/" + dirctory + "/" + photo_guess_id + ".jpg";
                    photo_guess.save();
					console.log(photo_guess.photo_url);
                    return   res.render("front/ershou/result");
                });
            })
        })
    }else{
        Photo_Guess.newAndSave(photo_url,"", "", "", cn_name, en_name, introduction, wx_account,0, region_code, range,false,source,"","","ershou",price,"","","",function (err, photo_guess) {
            if (err) {
                console.log(err);
                return;
            }
			console.log(photo_guess.photo_url);
            return   res.render("front/ershou/result");

        })
    }
}



exports.ershou_result=function (req, res, next) {
    return   res.render("front/ershou/result");
}



exports.back_ershou_index = function (req, res, next) {
    var page = parseInt(req.query.page, 10) || 1;
    var common=req.query.common;
    var all=req.query.all;
    var en_name=req.query.en_name;
    page = page > 0 ? page : 1;
    var limit = 100;
    var sort = [
        [ 'create_at', 'desc' ]
    ];
    var options = { skip: (page - 1) * limit, limit: limit, sort: sort};
    Configuration.getConfigurationByCode(DateFormat(1), function (err, start_cfg) {
        Configuration.getConfigurationByCode(TodayFormat(), function (err, end_cfg) {
            var query = {region_code: req.query.region_code,type:"ershou",create_at: {
                "$gt": new Date(start_cfg.value),
                "$lt": new Date(end_cfg.value)
            }};
            if(common&&(common!='undefined')){
                query = {region_code: req.query.region_code,range:1,type:"ershou", create_at: {
                    "$gt": new Date(start_cfg.value),
                    "$lt": new Date(end_cfg.value)
                }};
            }
            if(all||(!end_cfg)){
                query = {region_code: req.query.region_code,type:"ershou", create_at: {
                    "$gt": new Date(start_cfg.value)

                }};
            }
            if(en_name){
                query = {en_name: en_name,type:"ershou", create_at: {
                    "$gt": new Date(start_cfg.value),
                    "$lt": new Date(end_cfg.value)
                }};
            }
            var proxy = EventProxy.create('photo_guesss', 'pages',
                function (photo_guesss, pages) {
                    res.render('back/ershou/index', {
                        photo_guesss: photo_guesss,
                        pages: pages,
                        current_page: page,
                        region_code: req.query.region_code,
                        common:common
                    });
                });
            proxy.fail(next);
            Photo_Guess.getPhoto_GuessByQuery(query, options, function (err, photo_guesss) {
                photo_guesss.forEach(function (photo_guess, i) {

                    if (photo_guess) {
                        photo_guess.friendly_create_at = Util.format_date(photo_guess.create_at, true);
                        photo_guess.friendly_photo_url = '/public/front/photo_guess/' + photo_guess.create_at.getFullYear() + "" + (photo_guess.create_at.getMonth() + 1) + "" + photo_guess.create_at.getDate() + "/" + photo_guess._id + "welife" + ".jpg";
                    }
                    return photo_guesss;
                });
                proxy.emit('photo_guesss', photo_guesss);
            })

            Photo_Guess.getCountByQuery(query, proxy.done(function (all_count) {
                var pages = Math.ceil(all_count / limit);
                proxy.emit('pages', pages);
            }));
        })
    })
}





 exports.remove = function (req, res, next) {
     var page = parseInt(req.query.page, 10) || 1;
     var limit = 10000;
     var sort = [
         [ 'create_at', 'desc' ]
     ];
     var options = { skip: (page - 1) * limit, limit: limit, sort: sort};
     Configuration.getConfigurationByCode(YesTodayFormat(), function (err, start_cfg) {
         Configuration.getConfigurationByCode(TodayFormat(), function (err, end_cfg) {
             var query = {type: "ershou", create_at: {
                 "$gt": new Date(start_cfg.value),
                 "$lt": new Date(end_cfg.value)
             }};
             Photo_Guess.getPhoto_GuessByQuery(query, options, function (err, photo_guesss) {
                 photo_guesss.forEach(function (photo_guess, i) {
                     console.log(i);
                     photo_guess.remove();
                 });
             })

         });
     });
 }

exports.show_result_ershou = function (req, res, next) {
    School.getSchoolsByQuery({region_code: req.query.region_code}, {}, function (err, schools) {
        res.render('back/ershou/result', {schools: schools});
    })
}


exports.update_photo_guess = function (req, res, next) {
    Photo_Guess.getPhoto_GuessByQuery({},{},function(err,photos){
        var i=0;

        photos.forEach(function(photo,i){
            console.log(i);
            photo.type="photo_guess";
            photo.save();
        })
    });
}







///生成结果
exports.result_ershou_region = function (req, res, next) {

    var en_name = req.body.en_name;
    var region_code = req.body.region_code;
    if(en_name=="bj"){
        region_code="010";
    }
    if(en_name=="xa"){
        region_code="029";
    }
    if(en_name=="sh"){
        region_code="021";
    }
    if(en_name=="tj"){
        region_code="022";
    }
    var templete_yschool_ = "<blockquote style='margin: 0.2em; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; border-top-width: 3px; border-right-width: 3px; border-bottom-width: 3px; border-top-style: solid; border-right-style: solid; border-bottom-style: solid; border-color: rgb(201, 201, 201); white-space: normal; max-width: 100%; color: rgb(62, 62, 62); font-size: 15px; line-height: 24px; font-family: 宋体; -webkit-box-shadow: rgb(170, 170, 170) 0px 0px 10px; box-shadow: rgb(170, 170, 170) 0px 0px 10px; text-align: center; box-sizing: border-box !important; word-wrap: break-word !important; background-color: rgb(255, 255, 255);'>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; box-sizing: border-box !important;'><br></p>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; box-sizing: border-box !important;'>" +
        "<img data-s='300,640' data-src='#photo_guess_url#' data-ratio='1.0020366598778003' data-w='491' style='-moz-transform:rotate(#transform#deg); -webkit-transform:rotate(#transform#deg);transform:rotate(#transform#deg);margin: 0px; padding: 0px; box-sizing: border-box !important; word-wrap: break-word !important; visibility: visible !important; width: auto !important; height: auto !important;' _width='auto' src='#photo_guess_url#'>#br#</p>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>所在学校：</strong></span><span style='color: rgb(89, 89, 89);'>#school#</span></p>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>类型：</strong></span><span style='color: rgb(89, 89, 89);'>#source#</span></p>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>描述：</strong></span><span style='color: rgb(89, 89, 89);'>#introduce#</span></p>" +
        // "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>#pricetype#：</strong></span><span style='color: rgb(89, 89, 89);'>#price#</span></p>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>微信号：</strong></span><span style='color: rgb(89, 89, 89);'>#wxaccount#</span></p>"


    var templete_yschoolqiugou = "<blockquote style='margin: 0.2em; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; border-top-width: 3px; border-right-width: 3px; border-bottom-width: 3px; border-top-style: solid; border-right-style: solid; border-bottom-style: solid; border-color: rgb(201, 201, 201); white-space: normal; max-width: 100%; color: rgb(62, 62, 62); font-size: 15px; line-height: 24px; font-family: 宋体; -webkit-box-shadow: rgb(170, 170, 170) 0px 0px 10px; box-shadow: rgb(170, 170, 170) 0px 0px 10px; text-align: center; box-sizing: border-box !important; word-wrap: break-word !important; background-color: rgb(255, 255, 255);'>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; box-sizing: border-box !important;'><br></p>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; box-sizing: border-box !important;'>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>所在学校：</strong></span><span style='color: rgb(89, 89, 89);'>#school#</span></p>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>类型：</strong></span><span style='color: rgb(89, 89, 89);'>#source#</span></p>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>描述：</strong></span><span style='color: rgb(89, 89, 89);'>#introduce#</span></p>" +
        // "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>#pricetype#：</strong></span><span style='color: rgb(89, 89, 89);'>#price#</span></p>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>微信号：</strong></span><span style='color: rgb(89, 89, 89);'>#wxaccount#</span></p>"

    var result = "";
    var sort = [
        [ 'create_at', 'desc' ]
    ];
    var index = 1;
    var cn_title;
    var options = { sort: sort};
    Configuration.getConfigurationByCode(YesTodayFormat(), function (err, start_cfg) {
        Configuration.getConfigurationByCode(TodayFormat(), function (err, end_cfg) {
            Photo_Guess.getPhoto_GuessByQuery({region_code: region_code,type:"ershou",source:"chushou", pass: true, range: 1, create_at: {
                "$gt": new Date(start_cfg.value),
                "$lt": new Date(end_cfg.value)
            }}, options, function (err, photo_guesses) {
                var number = photo_guesses.length > 100 ? 100 : photo_guesses.length;
                console.log("++++"+ photo_guesses.length);
                while (number > 0) {
                    var random = parseInt((photo_guesses.length - 1) * Math.random());
                    // result += replaceExEershou(templete_yschool_, photo_guesses[random]);
                    if(photo_guesses[random].source=="qiugou"){
                        result += replaceExEershou(templete_yschoolqiugou, photo_guesses[random]);
                    }else{
                        result += replaceExEershou(templete_yschool_, photo_guesses[random]);
                    }
                    photo_guesses.splice(random, 1);
                    number--;
                }
                SchoolEx.getSchoolByEname(en_name, function (err, school) {
                    school.ershou_content = result;
                    school.save();
                    return res.json({ success: true});
                })
            });
        });
    });
}

///生成结果
exports.result_ershou = function (req, res, next) {
    var en_name = req.body.en_name;
    var region_code = req.body.region_code;
    var templete_yschool_ = "<blockquote style='margin: 0.2em; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; border-top-width: 3px; border-right-width: 3px; border-bottom-width: 3px; border-top-style: solid; border-right-style: solid; border-bottom-style: solid; border-color: rgb(201, 201, 201); white-space: normal; max-width: 100%; color: rgb(62, 62, 62); font-size: 15px; line-height: 24px; font-family: 宋体; -webkit-box-shadow: rgb(170, 170, 170) 0px 0px 10px; box-shadow: rgb(170, 170, 170) 0px 0px 10px; text-align: center; box-sizing: border-box !important; word-wrap: break-word !important; background-color: rgb(255, 255, 255);'>" +
        "" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; box-sizing: border-box !important;'>" +
        "<img data-s='300,640' data-src='#photo_guess_url#' data-ratio='1.0020366598778003' data-w='491' style='-moz-transform:rotate(#transform#deg); -webkit-transform:rotate(#transform#deg);transform:rotate(#transform#deg);margin: 0px; padding: 0px; box-sizing: border-box !important; word-wrap: break-word !important; visibility: visible !important; width: auto !important; height: auto !important;' _width='auto' src='#photo_guess_url#'>#br#</p>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>所在学校：</strong></span><span style='color: rgb(89, 89, 89);'>#school#</span></p>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>类型：</strong></span><span style='color: rgb(89, 89, 89);'>#source#</span></p>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>描述：</strong></span><span style='color: rgb(89, 89, 89);'>#introduce#</span></p>" +
       // "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>#pricetype#：</strong></span><span style='color: rgb(89, 89, 89);'>#price#</span></p>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>微信号：</strong></span><span style='color: rgb(89, 89, 89);'>#wxaccount#</span></p>"
    var templete_nschool = "<blockquote style='margin: 0.2em; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; border-top-width: 3px; border-right-width: 3px; border-bottom-width: 3px; border-top-style: solid; border-right-style: solid; border-bottom-style: solid; border-color: rgb(201, 201, 201); white-space: normal; max-width: 100%; color: rgb(62, 62, 62); font-size: 15px; line-height: 24px; font-family: 宋体; -webkit-box-shadow: rgb(170, 170, 170) 0px 0px 10px; box-shadow: rgb(170, 170, 170) 0px 0px 10px; text-align: center; box-sizing: border-box !important; word-wrap: break-word !important; background-color: rgb(255, 255, 255);'>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; box-sizing: border-box !important;'>" +
        "<img data-s='300,640' data-src='#photo_guess_url#' data-ratio='1.0020366598778003' data-w='491' style='-moz-transform:rotate(#transform#deg); -webkit-transform:rotate(#transform#deg);transform:rotate(#transform#deg);margin: 0px; padding: 0px; box-sizing: border-box !important; word-wrap: break-word !important; visibility: visible !important; width: auto !important; height: auto !important;' _width='auto' src='#photo_guess_url#'>#br#</p>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>缘分类型：</strong></span><span style='color: rgb(89, 89, 89);'>#source#</span></p>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>描述：</strong></span><span style='color: rgb(89, 89, 89);'>#introduce#</span></p>" +
       // "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>#pricetype#：</strong></span><span style='color: rgb(89, 89, 89);'>#price#</span></p>" +

        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>微信号：</strong></span><span style='color: rgb(89, 89, 89);'>#wxaccount#</span></p>"


    var templete_yschoolqiugou = "<blockquote style='margin: 0.2em; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; border-top-width: 3px; border-right-width: 3px; border-bottom-width: 3px; border-top-style: solid; border-right-style: solid; border-bottom-style: solid; border-color: rgb(201, 201, 201); white-space: normal; max-width: 100%; color: rgb(62, 62, 62); font-size: 15px; line-height: 24px; font-family: 宋体; -webkit-box-shadow: rgb(170, 170, 170) 0px 0px 10px; box-shadow: rgb(170, 170, 170) 0px 0px 10px; text-align: center; box-sizing: border-box !important; word-wrap: break-word !important; background-color: rgb(255, 255, 255);'>" +

        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; box-sizing: border-box !important;'>" +
         "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>所在学校：</strong></span><span style='color: rgb(89, 89, 89);'>#school#</span></p>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>类型：</strong></span><span style='color: rgb(89, 89, 89);'>#source#</span></p>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>描述：</strong></span><span style='color: rgb(89, 89, 89);'>#introduce#</span></p>" +
        // "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>#pricetype#：</strong></span><span style='color: rgb(89, 89, 89);'>#price#</span></p>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>微信号：</strong></span><span style='color: rgb(89, 89, 89);'>#wxaccount#</span></p>"
    var templete_nschoolqiugou = "<blockquote style='margin: 0.2em; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; border-top-width: 3px; border-right-width: 3px; border-bottom-width: 3px; border-top-style: solid; border-right-style: solid; border-bottom-style: solid; border-color: rgb(201, 201, 201); white-space: normal; max-width: 100%; color: rgb(62, 62, 62); font-size: 15px; line-height: 24px; font-family: 宋体; -webkit-box-shadow: rgb(170, 170, 170) 0px 0px 10px; box-shadow: rgb(170, 170, 170) 0px 0px 10px; text-align: center; box-sizing: border-box !important; word-wrap: break-word !important; background-color: rgb(255, 255, 255);'>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; box-sizing: border-box !important;'>" +
         "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>缘分类型：</strong></span><span style='color: rgb(89, 89, 89);'>#source#</span></p>" +
        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>描述：</strong></span><span style='color: rgb(89, 89, 89);'>#introduce#</span></p>" +
        // "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>#pricetype#：</strong></span><span style='color: rgb(89, 89, 89);'>#price#</span></p>" +

        "<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>微信号：</strong></span><span style='color: rgb(89, 89, 89);'>#wxaccount#</span></p>"



    var result = "";
    var sort = [
        [ 'create_at', 'desc' ]
    ];
    var index = 1;
    var cn_title;
    var options = { sort: sort};
    Configuration.getConfigurationByCode(YesTodayFormat(), function (err, start_cfg) {
        Configuration.getConfigurationByCode(TodayFormat(), function (err, end_cfg) {
            Photo_Guess.getPhoto_GuessByQuery({en_name: en_name, pass: true, type: "ershou", create_at: {
                "$gt": new Date(start_cfg.value),
                "$lt": new Date(end_cfg.value)
            }}, options, function (err, photo_guesses) {
                //第一步，如果小于6个人
                console.log(photo_guesses.length);
                if (photo_guesses.length < 6) {
                    photo_guesses.forEach(function (photo_guess, i) {
                        if (photo_guess) {
                            if(photo_guess.source=="qiugou"){
                                result += replaceExEershou(templete_yschoolqiugou, photo_guess);
                            }else{
                                result += replaceExEershou(templete_yschool_, photo_guess);
                            }
                        }
                    });
                    //同时从本市其他高校中拿出一部分来
                    Photo_Guess.getPhoto_GuessByQuery({region_code: region_code,type:"ershou",source:"chushou",  en_name: {$ne: en_name}, pass: true, range: 1, create_at: {
                        "$gt": new Date(start_cfg.value),
                        "$lt": new Date(end_cfg.value)
                    }}, options, function (err, photo_guesses) {
                        var number = photo_guesses.length > 15 ? 15 : photo_guesses.length;
                        while (number > 0) {
                            var random = parseInt((photo_guesses.length - 1) * Math.random());

                            if(photo_guesses[random].source=="qiugou"){
                                result += replaceExEershou(templete_yschoolqiugou, photo_guesses[random]);
                            }else{
                                result += replaceExEershou(templete_yschool_, photo_guesses[random]);
                            }

                           // result += replaceExEershou(templete_yschool_, photo_guesses[random]);
                            photo_guesses.splice(random, 1);
                            number--;
                        }
                        SchoolEx.getSchoolByEname(en_name, function (err, school) {
                            school.ershou_content = result;
                            school.save();
                            return res.json({ success: true});
                        })
                    });
                } else {
                    console.log(photo_guesses.length);
                    result += "<p></p><p><span style='color: rgb(247, 150, 70);font-size:20px'><strong>本校信息</strong></span></p><p></p>";
                    photo_guesses.forEach(function (photo_guess, i) {
                        if (photo_guess) {

                            if(photo_guess.source=="qiugou"){
                                result += replaceExEershou(templete_nschoolqiugou, photo_guess);
                            }else{
                                result += replaceExEershou(templete_nschool, photo_guess);
                            }
                          //  result += replaceExEershou(templete_nschool, photo_guess);
                        }
                    });
                    result += "<p></p><p><span style='color: rgb(247, 150, 70);font-size:20px'><strong>周边高校</strong></span></p><p></p>";
                    //同时从本市其他高校中拿出一部分来
                    Photo_Guess.getPhoto_GuessByQuery({region_code: region_code,type:"ershou",source:"chushou", en_name: {$ne: en_name}, pass: true, range: 1, create_at: {
                        "$gt": new Date(start_cfg.value),
                        "$lt": new Date(end_cfg.value)
                    }}, options, function (err, photo_guesses) {
                        var number = photo_guesses.length > 15 ? 15 : photo_guesses.length;
                        while (number > 0) {
                            var random = parseInt((photo_guesses.length - 1) * Math.random());
                           // result += replaceExEershou(templete_yschool_, photo_guesses[random]);
                            if(photo_guesses[random].source=="qiugou"){
                                result += replaceExEershou(templete_yschoolqiugou, photo_guesses[random]);
                            }else{
                                result += replaceExEershou(templete_yschool_, photo_guesses[random]);
                            }
                            photo_guesses.splice(random, 1);
                            number--;
                        }
                        SchoolEx.getSchoolByEname(en_name, function (err, school) {
                            school.ershou_content = result;
                            school.save();
                            return res.json({ success: true});
                        })
                    });
                }
            })
        });
    });
}

function replaceExEershou(temp,photo_guess){
    var result="";
    var single_tem="<p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; word-wrap: normal; min-height: 1em; white-space: pre-wrap; text-align: left; box-sizing: border-box !important;'><span style='color: rgb(247, 150, 70);'><strong>#title#：</strong></span><span style='color: rgb(89, 89, 89);'>#content#</span></p>"
    result += temp.replace(/#photo_guess_url#/g, photo_guess.wx_photo_url)
        .replace(/#school#/g, photo_guess.cn_name)
        .replace(/#introduce#/g, photo_guess.introduction)
        .replace(/#source#/g,  photo_guess.source=="qiugou"?"求购":'出售')
        .replace(/#wxaccount#/g,photo_guess.wx_account)
        .replace(/#pricetype#/g,  photo_guess.source=="qiugou"?"期望价格":'价格')
        .replace(/#price#/g,  photo_guess.price);
    if(!photo_guess.transform){
        photo_guess.transform=0;
    }
    if(photo_guess.transform>0){
        result =result.replace(/#br#/g,"<p style='height:50px'>");
    }
    result =result.replace(/#br#/g,"");
    result =result.replace(/#transform#/g,photo_guess.transform);
    result += "</blockquote><p></p>"

    return result
}

