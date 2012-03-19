/**    
 * TEditor (Tencent HTML5 Rich Editor)
 * Copyright (c) 2012, webpluz.org, All rights reserved.
 * https://github.com/qwt/TEditor
 *
 * @version    1.0
 * @author    Azrael(<a href="mailto:azrael@imatlas.com">azrael@imatlas.com</a>)
 *
 */

/**    
 * @description
 * HTML5 富文本编辑器
 * 基于Jx框架
 *
 */
;Jx().$package('TE', function(J){

    /**
     * Editor 类定义
     */
    var Editor = new J.Class({
        init: function(option) {
            option = option || {};
            var container = option.container;
            if(!container){
                throw new Error('must assign a container!');
            }
            if(option.toolbar){
                this.createToolbar(option);
            }
            this.createDom(container);
            this.setEditable(true);
            this.newline();
        },
        createToolbar: function(option){
            //TODO
        },
        createDom: function(container){
            //create dom
            var panel = J.dom.node('div', {
                'class': 'teditor-container'
            });
            container.appendChild(panel);
            var iframe = J.dom.node('iframe', {
                src: 'about:blank',
                frameBorder: 0,
                'class': 'teditor-iframe'
            });
            panel.appendChild(iframe);
            J.dom.addClass(textarea, 'teditor-textarea');
            var textarea = J.dom.node('textarea', {
                'class': 'teditor-textarea'
            });
            panel.appendChild(textarea);

            this.iframe = iframe;
            this.textarea = textarea;
            this.win = TE.util.getWindow(iframe);
            this.doc = TE.util.getDocument(iframe);

        },
        setEditable: function(status){
            if(status){
                this.doc.designMode='on';
            }else{
                this.doc.designMode='off';
            }
        },
        getSelection: function(){
            return TE.util.getSelection(this.win);
        },
        getRange: function(){
            return TE.util.getRange(this.win, this.doc.body);
        },
        restoreRange: function(range){
            var selection = this.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        },
        newline: function(){
            this.doc.body.focus();//TODO 这里有隐患
            var range = this.getRange();
            var div = J.dom.node('div');
            div.innerHTML = '<br/>';
            range.insertNode(div);
            range.selectNodeContents(div);
            this.restoreRange(range);
        },
        clear: function(){
            this.doc.body.innerHTML = '';
            this.newline();
        },
        setStyle: function(prop, value){
            var range = this.getRange();
            console.log(range);
            //range是否在同一个节点上?
            if(range.startContainer === range.endContainer){
                //在同一个节点, 继续判断是否已经被包含了 span ?
                var rangeParent = range.startContainer.parentNode;
                if(rangeParent.tagName === 'SPAN'){
                    //已经被span包含了
                    //是否已经有这个样式?
                    if(J.dom.getStyle(rangeParent, prop) === value){
                        //是也, 返回
                        return;
                    }
                    //是否整个span都在range里面?
                    if(range.startOffset === 0 && range.endOffset === range.endContainer.length){
                        //是的整个整个range都在span里, 直接设置parentNode的样式吧
                        J.dom.setStyle(rangeParent, prop, value);
                    }else{
                        //悲剧, range只是span其中一部分, 拆成三段
                        var oldStyle = rangeParent.style.cssText;
                        var span = J.dom.node('span', {
                            style: oldStyle
                        });
                        var frag = this.doc.createDocumentFragment();
                        var span2;
                        var beforeText = range.startContainer.textContent.substr(0, range.startOffset);
                        var afterText = range.endContainer.textContent.substr(range.endOffset);
                        if(beforeText){
                            span2 = span.cloneNode(true);
                            span2.innerHTML = beforeText;
                            frag.appendChild(span2);
                        }
                        frag.appendChild(span);
                        if(afterText){
                            span2 = span.cloneNode(true);
                            span2.innerHTML = afterText;
                            frag.appendChild(span2);
                        }
                        span.innerHTML = range.toString();
                        J.dom.setStyle(span, prop, value);
                        
                        range.selectNode(rangeParent);
                        range.deleteContents();
                        range.insertNode(frag);
                        range.selectNode(span);
                        this.restoreRange(range);
                    }
                }else{//没有包含span, 直接加一个
                    var span = J.dom.node('span', {
                        style: prop + ': ' + value
                    });
                    range.surroundContents(span);
                    range.selectNode(span);
                    this.restoreRange(range);
                }   
            }else{
                //跨了几个节点的range
                var span = J.dom.node('span', {
                    style: prop + ': ' + value
                });
                var df = range.cloneContents();
                range.deleteContents();
                range.insertNode(span);
                span.appendChild(df);
                range.selectNode(span);
                this.restoreRange(range);
            }
        }
    });
    /**
     * 观察者方法
     * @type {Object}
     */
    var observer = {

    }

    /**
     * 入口函数
     * @param  {Object} option 
     * @return {TEditor} instance of TEditor
     */
    this.create = function(option) {
        //TODO any other actions
        return new Editor(option);
    }

});
