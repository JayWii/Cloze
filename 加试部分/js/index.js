// 简单对选择器进行封装
var $ = document.querySelectorAll.bind(document);

// ============================全局变量===============================
// 获取需要渲染的数据,此处通过data.js模拟已从服务器获取到JSON数据 articleItem
var data = articleItem;
// 配置正确答案和用户选择的答案
var correctAnswer = data.artAnswers;
var userAnswer = [];
// 保存选项数组用于后期判断某选项是否已经被选过
var originOptions = [];
// 解析
var artKeys = data.artKeys;
// 成绩数组
var gradeArr = [];
// 正确率
var accuracy = '';
// 判断是否可交卷（假如已经交过卷则不可交卷，后续可添加重做功能）
var canSubmit = true;
// 判断是否已显示解析，若是，则不再进行解析处理
var hadKeys = false;
// ======================end of 全局变量==============================

// 预处理部分数据
// 初始化用户答案数组
for (var i = 0; i < correctAnswer.length; i++) {
  userAnswer[i] = ' ';
}
//简单地为数组添加一个changeValue方法，以方便在数组元素变化时自动作出响应
Array.prototype.changeValve = function(index,newValue){
    this[index] = newValue;
    if(this.callback) this.callback.call(this,index,newValue);
}
//用于用户点击选择了单词后显示在原文中
userAnswer.callback = function (index,newValue) {
  $('.blank')[index].textContent = newValue;
}

// ==========================渲染处理部分==============================
// 渲染正文部分
function renderArticle() {
  // 配置填空位标志
  var blankMark = '$blank$';
  // 获取并渲染正文
  var articleData = data.article;
  //var articleArr = articleData.split(blankMark);
  //var displayArticle = '';
  var blankCont = 1;
  for (var i = 0; i < articleData.length; i++) {
    var p = document.createElement('p');
    p.className = 'para' + (i+1);
    var pArr = articleData[i].split(blankMark);
    console.log(pArr);
    for (var k = 0; k < pArr.length; k++) {
      if (k === pArr.length - 1) {
        p.innerHTML += '<span class="articleContent">' + pArr[k] + '</span> ';
      }else{
        p.innerHTML += '<span class="articleContent">' + pArr[k] + '</span> ' + (blankCont) + ' <span class="blank" id="blank_' + (blankCont - 1) + '"> </span>';
        blankCont++;
      }
    }
    $('.content')[0].appendChild(p);
  }
}

// 根据填空数量渲染题号按钮
function renderNumBtn() {
  var btnNum = data.artAnswers.length;
  for (var i = 0; i < btnNum; i++) {
    var btn = document.createElement('button');
    btn.textContent = i + 1;
    btn.id = 'btn_' + i;
    btn.className = 'btn-item';
    $('.number')[0].appendChild(btn);
  }
}

// 渲染选项
function renderOptions() {
  var options = data.artOptions;
  // 随机打乱选项顺序
  options = options.sort(function(){ return 0.5 - Math.random() });
  originOptions = options;
  for (var i = 0; i < options.length; i++) {
    var div = document.createElement('div');
    div.className = 'option';
    div.textContent = options[i];
    $('.options')[0].appendChild(div);
  }
}

// 把json数据渲染到页面上
(function renderData() {
  renderArticle();
  renderNumBtn();
  renderOptions();
})();

// ==========================end of 渲染处理部分==============================

// ==========================交互处理部分=====================================
// =========================================================================
/*
 * 封装事件监听函数
 * target：监听对象
 * type：监听函数类型，如click,mouseover
 * func：监听函数
 */
function addEventHandler(target,type,func){
 if(target.addEventListener){
  //监听IE9，谷歌和火狐
  target.addEventListener(type, func, false);
 }else if(target.attachEvent){
  target.attachEvent("on" + type, func);
 }else{
  target["on" + type] = func;
 }
}
// 类处理函数
function hasClass(el,cName){
  return !!el.className.match( new RegExp( "(\\s|^)" + cName + "(\\s|$)") ); // ( \\s|^ ) 判断前面是否有空格 （\\s | $ ）判断后面是否有空格
}
function addClass(el,cName){
  if(!hasClass(el,cName)){
    el.className += " " + cName;
  }
}
function removeClass(el,cName){
  if(hasClass(el,cName)){
    el.className = el.className.replace( new RegExp( "(\\s|^)" + cName + "(\\s|$)" )," " );
  }
}

// ==========================正文部分=================================
//
// 点击空处时改变blank样式，并为相应题号按钮下方添加指示标记
function changeBlankStyle(type,value) {
  var blanks = $('.blank');
  var activeStyle = '';
  if (hadKeys) {
    activeStyle = 'blank-active blank-active-submited';
  }else{
    activeStyle = 'blank-active';
  }
  for (var i = 0; i < blanks.length; i++) {
    removeClass(blanks[i],activeStyle);
  }
  if (type === 'el') {
    addClass(value,activeStyle);
  }else{
    addClass(blanks[value],activeStyle);
  }
}

// 监听blank
function listenBlank() {
  var blanksWrap = $('.content')[0];
  addEventHandler(blanksWrap,'click',function (event) {
    var target = event.target || event.srcElement;
    if ((target.className !== '') && (target.className.trim().indexOf('blank') > -1)) {
      var blankIndex = parseInt(target.id.replace('blank_',''));
      changeBlankStyle('el',target);
      addFlagForBtn('num',blankIndex);
      if (hadKeys) {
        renderKey(blankIndex);
      }
    }
  })
}
// ==========================end of 正文部分=================================


// ==========================题号按钮部分=================================
//
// 点击按钮式为按钮下方添加指示标记
function addFlagForBtn(type,value) {
  var btns = $('.number button');
  for (var i = 0; i < btns.length; i++) {
    removeClass(btns[i],'btn-active');
  }
  if (type === 'el') {
    addClass(value,'btn-active');
  }else{
    addClass(btns[value],'btn-active');
  }
}

// 监听按钮
function listenBtn() {
  var btnsWrap = $('.number')[0];
  addEventHandler(btnsWrap,'click',function (event) {
    var target = event.target || event.srcElement;
    if (target.className.indexOf('btn-item') > -1) {
      var btnIndex = parseInt(target.id.replace('btn_',''));
      addFlagForBtn('el',target);
      changeBlankStyle('num',btnIndex);
      if (hadKeys) {
        renderKey(btnIndex);
      }
      //点击按钮后假如按钮对应的blank不在可视范围内，则将其滚动到可视范围内
      var blanks = $('.blank');
      var contentOffsetTop = $('.content')[0].offsetTop;
      var targetOffsetTop = blanks[btnIndex].offsetTop;
      var targetToWrapTop = targetOffsetTop - contentOffsetTop;
      var contentHeight = $('.content')[0].offsetHeight;
      var contScrollTop = $('.content')[0].scrollTop;
      //blank在可视区域下方
      if (targetToWrapTop > (contentHeight + contScrollTop)) {
        $('.content')[0].scrollTop = targetToWrapTop - contentHeight + 50;
      }
      //blank在可视区域上方
      if (targetToWrapTop < contScrollTop) {
        $('.content')[0].scrollTop = contScrollTop - targetToWrapTop - 50;
      }
    }
  })
}

// 解析状态下，点击按钮或者blank显示对应的解析
function renderKey(index) {
  var keyWrap = $('.key')[0];
  keyWrap.textContent = artKeys[index].descr;
}


// ==========================end of 题号按钮部分=================================

// ==========================选项部分=================================
// 将mouseOver的选项显示在相应的blank里面
function renderOption(value) {
  var activeBlank = $('.blank-active')[0];
  // var lastValue = activeBlank.textContent;
  activeBlank.textContent = value;
}

//监听选项
function listenOption() {
  var optionsWrap = $('.options')[0];
  // 鼠标移入将选项内容显示到blank内
  addEventHandler(optionsWrap,'mouseover',function (event) {
    var activeBlank = $('.blank-active')[0];
    if (typeof(activeBlank) != 'undefined') {
      addClass($('.options')[0],'activeOptions');
      var target = event.target || event.srcElement;
      if (hasClass(target,'option')) {
        var value = target.textContent;
        // 将mouseOver的选项显示在相应的blank里面
        activeBlank.textContent = value;
      }
    }else{
      //blank未激活时选项划过无效果
      removeClass($('.options')[0],'activeOptions');
    }
  });
  // 鼠标移出blank显示原有答案
  addEventHandler(optionsWrap,'mouseout',function (event) {
    var activeBlank = $('.blank-active')[0];
    if (typeof(activeBlank) != 'undefined') {
      var activeBlankIndex = parseInt(activeBlank.id.replace('blank_',''));
      activeBlank.textContent = userAnswer[activeBlankIndex];
    }
  });
  // 鼠标点击选项，将答案数组更新，并将新选项显示在blank内，同时改变样式
  addEventHandler(optionsWrap,'click',function (event) {
    var activeBlank = $('.blank-active')[0];
    var optionsBtn = $('.number button');
    if (typeof(activeBlank) != 'undefined') {
      var target = event.target || event.srcElement;
      if (hasClass(target,'option')) {
        var newValue = target.textContent;
        var activeBlankIndex = parseInt(activeBlank.id.replace('blank_',''));
        var oldValue = userAnswer[activeBlankIndex];
        userAnswer.changeValve(activeBlankIndex,newValue);
        removeClass(activeBlank,'blank-active');
        addClass(optionsBtn[activeBlankIndex],'btn-selected');
        addClass(target,'option-selected');
        //判断选项中是否存在oldValue
        if (originOptions.indexOf(oldValue) > -1) {
          //判断oldValue是否还被其他地方选过
          if (userAnswer.indexOf(oldValue) === -1) {
            removeClass($('.option')[originOptions.indexOf(oldValue)],'option-selected');
          }
        }
      }
    }
  });
}

// ==========================end of 选项部分=================================

// ==========================提交功能部分=================================
//点击提交后得出用户成绩并进行展示
function submit() {
  if (canSubmit) {
    getGrade();
    displayGrade();
    //已交卷，再次点击交卷不再进行计算处理，直接显示
    canSubmit = false;
  }
  $('.grade-wrap')[0].style.display = 'block';
}

// 计算用户成绩
function getGrade() {
  var correntNum = 0;
  for (var i = 0; i < correctAnswer.length; i++) {
    // gradeArr[i] = (userAnswer[i].trim() === correctAnswer[i].trim()) ? true : false;
    if (userAnswer[i].trim() === correctAnswer[i].trim()) {
      gradeArr[i] = true;
      correntNum++;
    }else{
      gradeArr[i] = false;
    }
  }
  accuracy = parseFloat((correntNum / correctAnswer.length).toFixed(4)) * 100 + '%';
}

// 展示用户成绩
function displayGrade() {
  $('.accuracy')[0].textContent = accuracy;
  for (var i = 0; i < gradeArr.length; i++) {
    var div = document.createElement('div');
    div.textContent = (i+1);
    div.className = (gradeArr[i]) ? 'grade-item grade-item-correct' : 'grade-item grade-item-wrong';
    $('.grade .detail')[0].appendChild(div);
  }
}

// 监听提交按钮
function listenSubmit() {
  var submitBtn = $('#submit')[0];
  addEventHandler(submitBtn,'click',submit);
}

// ==========================end of 提交功能部分=================================

// ==========================解析部分=================================
//
// 点击查看解析之后对正文中的答案和题号按钮样式进行变更，并将选项部分替换为解析
function getKeys() {
  $('.grade-wrap')[0].style.display = 'none';
  $('.options')[0].style.display = 'none';
  $('.keys')[0].style.display = 'block';
  keysHeight = $('.keys')[0].offsetHeight;
  // 重置选中项
  if (!hadKeys) {
    if (typeof($('.blank-active')[0]) !== 'undefined') {
      removeClass($('.blank-active')[0],'blank-active');
    }
    if (typeof($('.btn-active       ')[0]) !== 'undefined') {
      removeClass($('.btn-active')[0],'btn-active');
    }
    addClass($('.blank')[0],'blank-active blank-active-submited');
    addClass($('.btn-item')[0],'btn-active');
    renderKey(0);
    dealContentAndBtn();
    hadKeys = true;
  }
}
// 处理正文部分
// 对的单词显示为绿色
// 错的用红色表示，并在后面跟正确单词
// 没做的红色划去空格，并在后面跟正确单词
// 处理按钮
// 错的显示为红色，对的为绿色
function dealContentAndBtn() {
  var blanks = $('.blank');
  var btns = $('.btn-item');
  for (var i = 0; i < gradeArr.length; i++) {
    if (gradeArr[i]) {
      addClass(blanks[i],'blank-correct');
      addClass(btns[i],'btn-correct');
    }else{
      addClass(blanks[i],'blank-wrong');
      addClass(btns[i],'btn-wrong');
      var span = document.createElement('span');
      span.className = 'correct-span';
      span.textContent = correctAnswer[i];
      insertAfter(span,blanks[i]);
    }
  }
}

// 在某元素后插入新的元素
function insertAfter(newElement,targetElement){
   var parent = targetElement.parentNode;
   if ( parent.lastChild == targetElement ){
      // 如果最后的节点是目标元素，则直接添加。
      parent.appendChild(newElement);
   }else{
      //如果不是，则插入在目标元素的下一个兄弟节点的前面。也就是目标元素的后面
      parent.insertBefore(newElement,targetElement.nextSibling);
   }
}

// 监听看解析按钮
function listenGetKeys() {
  var getKeysBtn = $('.get-keys')[0];
  addEventHandler(getKeysBtn,'click',getKeys);
}

// ==========================end of 解析部分=================================

// ==========================重做部分=================================
//点击重做之后重置数据和页面
function reset() {
  $('.content')[0].innerHTML = '';
  $('.number')[0].innerHTML = '';
  $('.options')[0].innerHTML = '';
  $('.options')[0].style.display = 'block';
  $('.keys')[0].style.display = 'none';
  $('.accuracy')[0].textContent = '0%';
  $('.grade .detail')[0].innerHTML = '';
  renderArticle();
  renderNumBtn();
  renderOptions();
  canSubmit = true;
  hadKeys = false;
  // 初始化用户答案数组
  for (var i = 0; i < correctAnswer.length; i++) {
    userAnswer[i] = ' ';
  }
}
// 监听看重做按钮
function listenRetry() {
  var retryBtn = $('#retry')[0];
  addEventHandler(retryBtn,'click',reset);
}
// ==========================end of 重做部分=================================

// 启动事件监听
(function initListener() {
  listenBlank();
  listenBtn();
  listenOption();
  listenSubmit();
  listenGetKeys();
  listenRetry();
})();

// ====================调整正文窗口高度=======================================
var clickY, topOffset;
var dragging  = false;
var dragBtn   = $('.drager .item-wrap')[0];
var contentHeight = $('.content')[0].offsetHeight;
var keysHeight = $('.keys')[0].offsetHeight;

addEventHandler(dragBtn,'mousedown',function () {
  dragging   = true;
  topOffset = $('.drager .item-wrap')[0].offsetTop;
})

addEventHandler(document,'mouseup',function () {
  dragging   = false;
  //更新高度
  contentHeight = $('.content')[0].offsetHeight;
  keysHeight = $('.keys')[0].offsetHeight;
})

document.onmousemove = function(e){
  if (dragging) {
    clickY = e.pageY;
    //console.log('移动距离：' + (clickY - topOffset) + 'px');
    if (((contentHeight + clickY - topOffset) > 280) && ((contentHeight + clickY - topOffset) < 520)) {
      $('.content')[0].style.height = contentHeight + (clickY - topOffset) + 'px';
    }
    if (((keysHeight - clickY + topOffset) > 50) && ((keysHeight - clickY + topOffset) < 200)) {
      $('.keys')[0].style.height = keysHeight - (clickY - topOffset) + 'px';
    }
  }
};

// ==========================end of 交互处理部分==============================
// =========================================================================
