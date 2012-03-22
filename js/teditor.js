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
        createCursorPlaceholder: function(){
            var node = document.createElement('img');
            node.style.cssText = 'width: 0px; height: 0px;';
            return node;
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
//=================== 对外接口 =====================================
        setEditable: function(status){
            // if(status){
            //     this.doc.designMode='on';
            // }else{
            //     this.doc.designMode='off';
            // }
            if(status){
                this.doc.body.contentEditable = true;
            }else{
                this.doc.body.contentEditable = false;
            }
        },
        focus: function(){
            this.doc.body.focus();
        },
        blur: function(){
            this.doc.body.blur();
        },
        newline: function(){
            this.focus();//TODO 这里有隐患
            var range = this.getRange();
            var div = document.createElement('div');
            div.innerHTML = '<span><br/></span>';
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
            //TODO 插入后的样式是否要合并?
            //range是否在同一个节点上?
            if(range.startContainer === range.endContainer){
                //在同一个节点, 继续判断是否已经被包含了 span ?
                var rangeParent = range.startContainer.parentNode;
                //TODO 光标重合的处理?
                if(rangeParent.tagName === 'SPAN'){
                    //已经被span包含了
                    //是否已经有这个样式?
                    if(J.dom.getStyle(rangeParent, prop) === value){
                        //是也, 返回
                        return;
                    }
                    //是否range的开始和结束是合并的?(表现为光标)
                    // if(range.startOffset === range.endOffset){
                    //     //既然在一起, 改变parentNode的样式就行了
                    //     J.dom.setStyle(rangeParent, prop, value);
                    //     return;
                    // }
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
                        var frag = document.createDocumentFragment();
                        var span2;
                        var holder;
                        var beforeText = range.startContainer.textContent.substr(0, range.startOffset);
                        var afterText = range.endContainer.textContent.substr(range.endOffset);
                        var rangeText = range.toString();
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
                        J.dom.setStyle(span, prop, value);
                        
                        range.selectNode(rangeParent);
                        //这里没有删除之后的空标签问题
                        range.deleteContents();
                        range.insertNode(frag);
                        if(rangeText){
                            span.innerHTML = rangeText;
                            range.selectNode(span);
                            this.restoreRange(range);
                        }else{
                            //内容为空的时候要插入一个光标占位符
                            holder = this.createCursorPlaceholder();
                            span.appendChild(holder);
                            range.selectNode(holder);
                            range.collapse();
                            this.restoreRange(range);
                            this.focus();//不focus光标不出来啊
                        }
                        
                    }
                }else{//没有包含span, 直接加一个
                    var span = J.dom.node('span', {
                        style: prop + ': ' + value
                    });
                    range.surroundContents(span);
                    range.selectNode(span);
                    this.restoreRange(range);
                }
            }else{//=================================================================
                //跨了几个节点的range
                //防止调用 deleteContents 删除之后出现空标签
                if(range.startOffset === 0 && range.startContainer.parentNode.tagName === 'SPAN'){
                    //range的开始处于节点的开始处, 整个选中它吧, 父亲不是span就别捣乱
                    range.setStartBefore(range.startContainer.parentNode);
                }
                if(range.endOffset === range.endContainer.length && range.endContainer.parentNode.tagName === 'SPAN'){
                    //结束于节点末尾, 也选中他
                    range.setEndAfter(range.endContainer.parentNode);
                }
                //clone一份选中节点, cloneContents 方法会自动闭合选中的标签
                var frag = range.cloneContents();
                var retFrag = document.createDocumentFragment();
                var child, span, firstChild, lastChild;
                while(child = frag.childNodes[0]){
                    if(child.nodeType === 3){//文本节点
                        if(child.textContent){
                            span = J.dom.node('span', {
                                style: prop + ': ' + value
                            });
                            span.innerHTML = child.textContent;
                            retFrag.appendChild(span);
                        }
                        frag.removeChild(child);
                    }else if(child.nodeType === 1){//element
                        if(child.textContent){
                            if(J.dom.getStyle(child, prop) !== value){
                            //已经有这个样式就别搞了嘛
                                J.dom.setStyle(child, prop, value);
                            }
                            retFrag.appendChild(child);
                        }else{//这个节点没有文本内容, 浪费表情 <_<
                            frag.removeChild(child);
                        }
                    }
                }
                //deleteContents 会删除选中内容后, 自动闭合周边的标签
                range.deleteContents();
                range.insertNode(retFrag);
                this.restoreRange(range);
            }
        }//end of setStyle
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
