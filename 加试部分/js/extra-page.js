$(function () {
  // 全局变量
  var article = [];
  // 选中的填空项（答案）
  var answers = [];
  // 所有选项，包涵混淆项
  var options = [];
  // 答案解析
  var artKeys = [];
  //根据对象内部值进行对象数组排序
  function keysrt(key,type) {
    return function(a,b){
      return (type === 'desc') ? (a[key] < b[key])*1 : (a[key] > b[key])*1;
    }
  }
  // ===================== 第一步 ============================
  //
  //保存分割后的正文
  var articleArr = [];
  $('.article-input').val("      there has long been an old saying that there is no such thing as a great talent without great will power,which idencates an essential way to success.I'm totally approve of this point ,The following are my reasons.\n      First of all ,everyone wishes to succeed,but not all succeed in the end. the reason is that only a few people have a strong will.If Thomas Edison does not have a strong will ,he won't tried hundreds of materials before he succeed. then he was just a common man .what's more,no matter who you are ,you are bond to form three quantities ,patience,carefulness,and consentration in the road of success,It's hard to form them without a strong will .last but not the least.bearing what others cann't bear is challenging .And a great will can help you a lot.\n     In a word,although it's never easy to succeed ,doing efforts with a strong will ,and you will be the one.");

  $('.step1 .next').click(function(event) {
    var article = $('.article-input').val();
    if (article !== '') {
      var articleParaArr = article.split(/\n/);
      $('.words-table').empty();
      dataReset();
      //删除空项
      for (var i = 0; i < articleParaArr.length; i++) {
        if (articleParaArr[i] === '') {
          articleParaArr.splice(i,1);
        }
      }
      //将每一段分为单词数组
      for (var i = 0; i < articleParaArr.length; i++) {
        articleArr.push(articleParaArr[i].replace(/,/g,' , ').replace(/\./g,' . ').replace(/\?/g,' ? ').replace(/\!/g,' ! ').split(/\s+/));
      }
      for (var i = 0; i < articleArr.length; i++) {
        $('<p class="para para' + (i+1) + '"></p>').appendTo('.words-table');
        for (var k = 0; k < articleArr[i].length; k++) {
          if (articleArr[i][k] !== '') {
            $('<span class="word">' + articleArr[i][k] + '</span>').appendTo('.para' + (i+1));
          }else{
            if (articleArr[i][k] === '') {
              articleArr[i].splice(k,1);
            }
          }
        }
      }
      $('.step2').fadeIn();
      $('.step1 .next').text('若进行修改请点击保存');
    }else{
      alert('内容不能为空！');
    }
  });

  // ===================== 第二步 ============================
  //
  //临时保存答案数据
  var answerWords = [];
  $('.words-table').click(function (event) {
    target = event.target || event.srcElement;
    if ($(target).hasClass('word') && !$(target).hasClass('word-selected')) {
      $(target).addClass('word-selected');
      var answer = {
        value : $(target).text(),
        index : $('.words-table span').index($(target))*1,
        indexOfPara : $('.words-table p').index($(target).parent())*1,
        indexInPara : $(target).parent().find('span').index($(target))*1
      }
      answerWords.push(answer);
      answerWords.sort(keysrt('index','asc'));
    }else if ($(target).hasClass('word-selected')) {
      $(target).removeClass('word-selected');
      var value = $(target).text();
      var index = -1;
      for (var i = 0; i < answerWords.length; i++) {
        if (answerWords[i].value === value) {
          index = i;
        }
      }
      answerWords.splice(index,1);
    }
  });
  $('.step2 .next').click(function () {
    if (answerWords.length > 0) {
      answers = [];
      for (var i = 0; i < answerWords.length; i++) {
        answers.push(answerWords[i].value);
        //将标记为选项的地方替换为空格标记
        var row = answerWords[i].indexOfPara;
        var col = answerWords[i].indexInPara;
        articleArr[row][col] = '$blank$';
      }
      for (var i = 0; i < articleArr.length; i++) {
        article.push(articleArr[i].join(' '));
      }
      $('.options-table').empty();
      for (var i = 0; i < answers.length; i++) {
        $('<div>'+ answers[i] +'</div>').appendTo('.options-table');
      }
      $('.step3').fadeIn();
      $('.step2 .next').text('若进行修改请点击保存');
      document.body.scrollTop += 400;
    }else{
      alert('还没选中任何单词！')
    }
    // console.log(article);
    // console.log(answers);
  });

  // ===================== 第三步 ============================
  //
  $('.add-extra-option').click(function () {
    var extraOption = $('.step3 input').val().trim();
    if (extraOption !== '') {
      options.push(extraOption);
      $('.step3 input').val('');
      $('<div class="extra-option">'+ extraOption +'</div>').appendTo('.extra-options');
    }
  });
  //点击添加的选项将其删除
  $('.extra-options').click(function(event) {
    target = event.target || event.srcElement;
    if ($(target).hasClass('extra-option')) {
      var index = options.indexOf($(target).text());
      $(target).remove();
      options.splice(index,1);
    }
  });
  $('.step3 .next').click(function () {
    if (options.length > 0) {
      options = options.concat(answers);
      $('.answers').empty();
      // console.log(options);
      for (var i = 0; i < answers.length; i++) {
        $('<div class="answer">' + answers[i] + '</div>').appendTo('.answers');
      }

      $('.step4').fadeIn();
      $('.step3 .next').text('若进行修改请点击保存');
      document.body.scrollTop += 200;
    }else{
      alert('你还没输入任何单词');
    }
  });

  // ===================== 第四步 ============================
  //添加解析，此处用keyOBJ来保存解析数据，目前仅添加基本文字描述，克对obj进行扩展添加更多解析数据
  $('.answers').click(function(event) {
    $('.key-input').val('');
    target = event.target || event.srcElement;
    if ($(target).hasClass('answer')) {
      $(target).addClass('answer-active').siblings().removeClass('answer-active');
    }
    if ($(target).hasClass('answer-keyAdded')) {
      var index = $(target).parent().find('div').index($(target));
      $('.key-input').val(artKeys[index].descr);
    }
  });
  $('.add-key').click(function(event) {
    // 解析对应的答案索引
    if (($('.answer-active').length > 0)&&(!$('.answer-active').hasClass('answer-keyAdded'))) {
      var keyForAnswerIndex = answers.indexOf($('.answer-active').text());
      var keyObj = {
        index : keyForAnswerIndex,
        descr : $('.key-input').val()
      }
      artKeys.push(keyObj);
      artKeys.sort(keysrt('index','asc'));
      $('.answer-active').addClass('answer-keyAdded');
      if ($('.answer-keyAdded').length === answers.length) {
        $('.submit').fadeIn();
        document.body.scrollTop += 200;
      }
    }else if ($('.answer-active').hasClass('answer-keyAdded')) {
      alert('解析已修改');
    }else{
      alert('请先选择一个答案');
    }

  });

  //重置数据
  function dataReset() {
    article = [];
    answers = [];
    options = [];
    artKeys = [];
    articleArr = [];
    answerWords = [];
  }

  // ===================== 提交 ============================
  // 此处模拟服务器环境下的提交操作，用户点击提交页面将把一个包含题目信息的JSON对象发送给服务器
  // 做题页面则服务器将该对象发送给前端，前端页面完成必做题中的功能
  // 此处由于条件和时间限制，仅在控制台输出该JSON对象，该对象数据结构与data.js中保持一致

  $('.submit').click(function () {
    var articleItem = {
      article : article,
      artOptions : options,
      artAnswers : answers,
      artKeys : artKeys
    }
    alert('提交完成，测试阶段可在控制台看到结果数据');
    console.log(articleItem);
  });
});
