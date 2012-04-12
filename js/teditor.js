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
    var CURSOR_PLACEHOLDER_TYPE = 'IMG';
    var CURSOR_PLACEHOLDER_STYLE = 'width: 1px; height: 1px;';
    
    var INIT_PLACEHOLDER_TYPE = 'BR';

    var LINE_NODE_TYPE = 'DIV';
    var WORD_NODE_TYPE = 'SPAN';


    /**
     * TEditor 类定义
     */
    var TEditor = new J.Class({
        init: function(option) {
            option = option || {};
            var container = option.container;
            if(!container){
                throw new Error('must assign a container!');
            }
            if(option.toolbar){
                this.createToolbar(option.toolbar);
            }
            this.createDom(container);
            this.initEvents();
            this.setEditable(true);
            this.newline();
        },
        initEvents: function(){
            //dom event
            J.event.on(this.body, 'keydown', J.bind(observer.onKeyDown, this))

            //custom event
            J.event.addObserver(this, 'delete', J.bind(observer.onDelete, this));
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
            this.doc = this.win.document;
            this.body = this.doc.body;
        },
        createCursorPlaceholder: function(){
            var node = document.createElement(CURSOR_PLACEHOLDER_TYPE);
            node.style.cssText = CURSOR_PLACEHOLDER_STYLE;
            node.setAttribute('tcursor', 'tcursor');
            return node;
        },
        createLineNode: function(cssText){
            var node = document.createElement(LINE_NODE_TYPE);
            node.setAttribute('tline', 'tline');
            node.style.cssText = cssText || '';
            return node;
        },
        createWordNode: function(cssText){
            var node = document.createElement(WORD_NODE_TYPE);
            node.setAttribute('tword', 'tword');
            node.style.cssText = cssText || '';
            return node;
        },
        createCursorNode: function(){
            var node = document.createElement(INIT_PLACEHOLDER_TYPE);
            node.setAttribute('tcursor', 'tcursor');
            return node;
        },
        handleEmptyLine: function(lineNode, range){
            //检查这一行是否是空了, 空的话要插入 一个 文字容器
            if(!lineNode.childElementCount){
                range.selectNodeContents(lineNode);
                var word = this.createWordNode();
                var br = this.createCursorNode();
                word.appendChild(br);
                range.insertNode(word);
                range.selectNode(word);
            }
        },
        getLineNode: function(node){
            while(node && node !== this.body){
                if(node.tagName === LINE_NODE_TYPE){
                    return node;
                }else{
                    node = node.parentNode;
                }
            }
            return null;
        },
        getWordNode: function(node){
            while(node && node !== this.body){
                if(node.tagName === WORD_NODE_TYPE){
                    return node;
                }else{
                    node = node.parentNode;
                }
            }
            return null;
        },
        getSelection: function(){
            return TE.util.getSelection(this.win);
        },
        getRange: function(){
            this.focus();
            return TE.util.getRange(this.win, this.body);
        },
        restoreRange: function(range){
            var selection = this.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        },
        // 一堆 range 的判断处理
        isRangeAtWordStart: function(range){
            var word = this.getWordNode(range.startContainer);
            return word && range.startOffset === 0;
        },
        isRangeAtWordEnd: function(range){
            var word = this.getWordNode(range.endContainer);
            return word && range.endOffset === range.endContainer.length;
        },
        isRangeAtWholeWord: function(range){
            return this.isRangeAtWordStart(range) && this.isRangeAtWordEnd(range);
        },
        isRangeAtLineStart: function(range){
            var line = this.getLineNode(range.startContainer);
            return line && range.startOffset === 0;
        },
        isRangeAtLineEnd: function(range){
            var line = this.getLineNode(range.endContainer);
            //判断行尾的节点都是已经选中 word 节点的, 所以要用 childElementCount
            return line && range.endOffset === line.childElementCount;
        },
        isRangeAtWholeLine: function(range){
            return this.isRangeAtLineStart(range) && this.isRangeAtLineEnd(range);
        },
//=================== 对外接口 =====================================
        setEditable: function(status){
            // if(status){
            //     this.doc.designMode='on';
            // }else{
            //     this.doc.designMode='off';
            // }
            if(status){
                this.body.contentEditable = true;
            }else{
                this.body.contentEditable = false;
            }
        },
        focus: function(){
            this.body.focus();
        },
        blur: function(){
            this.body.blur();
        },
        newline: function(){
            var range = this.getRange();
            var line = this.createLineNode();
            var word = this.createWordNode();
            var br = this.createCursorNode();

            word.appendChild(br);
            line.appendChild(word);

            range.insertNode(line);
            range.selectNode(word);
            this.restoreRange(range);
        },
        clear: function(){
            this.body.innerHTML = '';
            this.newline();
        },
        setStyle: function(prop, value){
            var range = this.getRange();
            console.log(range);
            //TODO 插入后的样式是否要合并?
            //range是否在同一个节点上?
            if(range.startContainer === range.endContainer){
                //在同一个节点, 继续判断是否已经被包含了 span ?
                var rangeParent = range.commonAncestorContainer;
                if(rangeParent.tagName === WORD_NODE_TYPE){
                    //如果 本身 range就包含了整一个span(包括span本身), 那直接改样式就行了
                    if(J.dom.getStyle(rangeParent, prop) !== value){
                        J.dom.setStyle(rangeParent, prop, value);
                    }
                    return;
                }
                rangeParent = rangeParent.parentNode;
                //光标重合的处理?
                if(rangeParent.tagName === WORD_NODE_TYPE){
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
                        var span = this.createWordNode(oldStyle);
                        var frag = document.createDocumentFragment();
                        var tempNode;
                        var holder = null;
                        var beforeText = range.startContainer.textContent.substr(0, range.startOffset);
                        var afterText = range.endContainer.textContent.substr(range.endOffset);
                        var rangeText = range.toString();
                        if(beforeText){
                            tempNode = span.cloneNode(true);
                            tempNode.innerHTML = beforeText;
                            frag.appendChild(tempNode);
                        }
                        frag.appendChild(span);
                        if(afterText){
                            tempNode = span.cloneNode(true);
                            tempNode.innerHTML = afterText;
                            frag.appendChild(tempNode);
                        }
                        J.dom.setStyle(span, prop, value);
                        
                        if(rangeText){
                            span.innerHTML = rangeText;
                        }else{
                            //内容为空的时候要插入一个光标占位符
                            holder = this.createCursorPlaceholder();
                            span.appendChild(holder);
                        }

                        //把需要删除的选中后 delete
                        range.selectNode(rangeParent);
                        range.deleteContents();
                        range.insertNode(frag);
                        range.selectNode(holder || span);
                        if(holder){
                            range.collapse();
                            this.restoreRange(range);
                            this.focus();
                        }else{
                            this.restoreRange(range);
                        }
                    }
                }else{//没有包含span, 直接加一个
                    var span = this.createWordNode(prop + ': ' + value);

                    range.surroundContents(span);
                    range.selectNode(span);
                    this.restoreRange(range);
                }
            }else{//=================================================================
                //跨了几个节点的range
                //防止调用 deleteContents 删除之后出现空标签
                if(range.startOffset === 0 && range.startContainer.parentNode.tagName === WORD_NODE_TYPE){
                    //range的开始处于节点的开始处, 整个选中它吧, 父亲不是span就别捣乱
                    range.setStartBefore(range.startContainer.parentNode);
                }
                if(range.endOffset === range.endContainer.length && range.endContainer.parentNode.tagName === WORD_NODE_TYPE){
                    //结束于节点末尾, 也选中他
                    range.setEndAfter(range.endContainer.parentNode);
                }
                //clone一份选中节点, cloneContents 方法会自动闭合选中的标签
                //TODO 跨多行的处理
                var frag = range.cloneContents();
                var retFrag = document.createDocumentFragment();
                var child, span, firstChild, lastChild;
                while(child = frag.childNodes[0]){
                    if(child.nodeType === 3){//文本节点
                        if(child.textContent){
                            span = this.createWordNode(prop + ': ' + value);
         
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
        //dom event
        onKeyDown: function(e){
            var keyCode = Number(e.keyCode);
            var altKey = e.altKey, ctrlKey = e.ctrlKey, shiftKey = e.shiftKey;
            if(keyCode === 8 && !altKey){
                //TODO 还有delete 键呢?
                J.event.notifyObservers(this, 'delete', e);
            }else if(keyCode === 13 && !altKey){
                J.event.notifyObservers(this, 'enter', e);
            }
        },

        //custom event
        onDelete: function(e){
            var altKey = e.altKey, ctrlKey = e.ctrlKey, shiftKey = e.shiftKey;
            var range = this.getRange();
            if(ctrlKey && range.collapsed){//删除到行首
                //光标是重合的时候, 按 ctrl + delete 会删除到行首

            }else{
                var wordNode = this.getWordNode(range.commonAncestorContainer);
                if(range.startContainer === range.endContainer && wordNode){
                    //在同一个word节点里
                    //有span包含
                    if((range.startOffset === 1 && range.endOffset === 1 && range.endContainer.length === 1) ||
                        //出现光标的情况, 光标在第一个字符之后, 切只有一个字符了 eg: <span>a[]</span>
                        this.isRangeAtWholeWord(range)
                        //整块选中了
                    ){
                        e.preventDefault();
                        range.setEndBefore(wordNode);
                        range.setStartBefore(wordNode);
                        var lineNode = this.getLineNode(wordNode);
                        wordNode.parentNode.removeChild(wordNode);
                        if(lineNode){
                            this.handleEmptyLine(lineNode, range);
                        }
                        this.restoreRange(range);
                    }
                }else{//range 包含多个节点, 属于选中范围的情况, 直接delete了
                    e.preventDefault();
                    var lineNode = this.getLineNode(range.commonAncestorContainer);
                    var relateParent, relateOffset;
                    if(this.isRangeAtWordStart(range)){
                        wordNode = this.getWordNode(range.startContainer);
                        range.setStartBefore(wordNode);
                    }
                    if(this.isRangeAtWordEnd(range)){
                        wordNode = this.getWordNode(range.endContainer);
                        range.setEndAfter(wordNode);
                    }
                    if(!lineNode){//多行的问题
                        //没有行节点, 说明选中的是跨行的
                        if(this.isRangeAtLineEnd(range)){
                            //最后一行是选择到行末的
                            lineNode = this.getLineNode(range.endContainer);
                            range.setEndAfter(lineNode);
                            lineNode = this.getLineNode(range.startContainer);
                        }else{
                            //没有选到行末, 比较悲催
                            relateParent = range.startContainer;
                            relateOffset = range.startOffset;
                        }
                    }
                    range.deleteContents();
                    if(relateParent){
                        //把光标放到 选区之前
                        range.setStart(relateParent, relateOffset);
                        range.collapse(true);
                    }
                    if(lineNode){
                        this.handleEmptyLine(lineNode, range);
                    }
                    this.restoreRange(range);
                }//end of if(wordNode) else
            }
        }
    }

    /**
     * 入口函数
     * @param  {Object} option 
     * @return {TEditor} instance of TEditor
     */
    this.create = function(option) {
        //TODO any other actions
        return new TEditor(option);
    }

});
