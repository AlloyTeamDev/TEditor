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
            this.createDom(container);
        },
        createDom: function(container){
            var panel = document.createElement('div');
            J.dom.addClass(panel, 'teditor-container')
            container.appendChild(panel);
            var iframe = document.createElement('iframe');
            iframe.src = 'about:blank';
            iframe.frameBorder = 0;
            J.dom.addClass(iframe, 'teditor-iframe');
            panel.appendChild(iframe);
            J.dom.addClass(textarea, 'teditor-textarea');
            var textarea = document.createElement('textarea');
            panel.appendChild(textarea);

            

            this.iframe = iframe;
            this.textarea = textarea;

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
