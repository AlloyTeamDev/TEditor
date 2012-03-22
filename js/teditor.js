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
