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
 * 工具方法包
 *
 */
;Jx().$package('TE.util', function(J){
    
    /**
     * 获取当前页面的selection对象
     * @return {Selection}
     */
    this.getSelection = function(win) {
        win = win || window;
        var doc = win.document;
        //先判断ie专有的, 因为ie9对range的支持不完全啊>_<
        return (doc.selection) ? doc.selection : win.getSelection();
    };

    /**
     * 获取选中区, 如果传入了container, 则返回container的range
     * @param {HTMLElement} container, 目标range的容器, 可选
     * @return {Range}, null
     */
    this.getRange = function(container) {
        var selection = this.getSelection();
        if (!selection) {
            return null;
        }
        var range = selection.getRangeAt ? (selection.rangeCount ? selection.getRangeAt(0) : null) : selection.createRange();
        if (!range) {
            return null;
        }
        if (container) {
            if (this.contains(container, range)) {
                return range;
            } else {
                return null;
            }
        } else {
            return range;
        }

    };

    /**
     * 判断一个range是否被包含在container中
     * @param {HTMLElement} container
     * @param {Range} range
     * @return {Boolean}
     */
    this.contains = function(container, range) {
        var rangeParent = range.commonAncestorContainer || (range.parentElement && range.parentElement()) || null;
        if (rangeParent) {
            return TEditor.adapter.contains(container, rangeParent, true);
        }
        return false;
    };


});
