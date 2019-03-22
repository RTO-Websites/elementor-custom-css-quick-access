(function($){
    $( window ).on(
        'elementor:init',
        function () {

            let CcqaLoading = Backbone.Marionette.ItemView.extend({
                tagName: 'div',
                className: 'loading',
                template: '#ccqa-loading'
            });

            let CcqaElementorToggle = Backbone.Marionette.ItemView.extend({
                tagName: 'div',
                id: 'elementor-panel-footer-ccqa-toggle',
                className: 'elementor-panel-footer-tool',
                template: '#ccqa-elementor-toggle',
                attributes: {
                    title: "Open Elementor Custom CSS Qucik Access window",
                },
                triggers: {
                    'click': 'clicked'
                },
            });

            let CcqaSectionItemView = Backbone.Marionette.CompositeView.extend({
                tagName: "section",
                className: function() {
                    return this.isInner() ? "inner-section-wrapper" : "section-wrapper";
                },
                template: '#ccqa-template',
                childViewContainer: ".inner",
                initialize: function(){
                    this.collection = this.model.get('elements');
                    this.model.get('settings').on('change:css_classes',this.cssClassesChanged, this);
                    this.model.get('settings').on('change:_element_id',this.elementIdChanged, this);
                    this.model.get('settings').on('change:custom_css',this.customCssChanged, this);
                },
                getChildView: function getChildView(model) {
                    let elType = model.get('elType');

                    if ('section' === elType) {
                        return CcqaSectionItemView;
                    } else if ('column' === elType) {
                        return CcqaColumnItemView;
                    } else {
                        return CcqaWidgetItemView;
                    }
                },
                modelEvents: {
                    'change': "modelChanged"
                },
                modelChanged: function() {
                    this.render();
                },
                cssClassesChanged: function(model, value) {
                    if(ccqa.activeWindow && !ccqa.activeChildWindow) {
                        this.ui.custom_class.val(value);
                    }
                },
                elementIdChanged: function(model, value) {
                    if(ccqa.activeWindow && !ccqa.activeChildWindow) {
                        this.ui.custom_id.val(value);
                    }
                },
                customCssChanged: function(model, value) {
                    if(ccqa.activeWindow && !ccqa.activeChildWindow) {
                        this.editor.setValue(value, -1);
                        let currentPageView = elementor.panel.currentView.getCurrentPageView();

                        if(typeof(currentPageView.model) !== 'undefined'
                        && currentPageView.model.id === this.model.id
                        && currentPageView.activeSection === "section_custom_css") {
                            let aceEditor = elementor.panel.currentView.getCurrentPageView().getControlViewByName('custom_css').editor;
                            let pos = aceEditor.getCursorPosition();
                            this.editor.selection.moveTo(pos.row, pos.column);
                        }
                    }
                },
                collectionEvents: {
                    "add": "modelChanged"
                },
                events: {
                    'click @ui.title': 'onClickTitle',
                    'input @ui.custom_class': 'onInputClass',
                    'input @ui.custom_id': 'onInputId',
                },
                onClickTitle: function(e){
                    this.ui.content_wrapper.toggle();
                },
                onInputClass: function(e){
                    this.model.setSetting('css_classes', e.target.value);
                },
                onInputId: function(e){
                    this.model.setSetting('_element_id', e.target.value);
                },
                onInputCustomCss: function(value, e) {
                    this.model.setSetting('custom_css', value);
                    this.updateElementorAceEditor(e);
                },
                ui: {
                    title: '> .title',
                    content_wrapper: '> .content-wrapper',
                    custom_class: '> .content-wrapper > span > .custom-class',
                    custom_id: '> .content-wrapper > span > .custom-id'
                },
                templateHelpers: function() {
                    return { settings: {
                            icon: this.model.getIcon(),
                            title: this.model.getTitle(),
                            css_classes: this.model.getSetting("css_classes"),
                            _element_id: this.model.getSetting("_element_id"),
                            has_childs: this.model.get('elements').length
                        } };
                },
                onRender: function() {
                    this.initCodeEditor();
                },
                isInner: function isInner() {
                    return !!this.model.get('isInner');
                },
                initCodeEditor: function() {
                    let self = this;
                    let langTools = ccqa.ccqaWindow.ace.require("ace/ext/language_tools");
                    langTools.addCompleter(this.selectorCompleter());
                    let editor = ccqa.ccqaWindow.ace.edit(this.$el.find('.custom-css')[0]);
                    editor.session.setMode("ace/mode/css");
                    editor.setOptions(this.editorOptions());
                    editor.$blockScrolling = Infinity;
                    this.editor = editor;

                    this.editor.setValue(this.model.getSetting('custom_css'), -1);
                    this.editor.on('change', function (e) {
                        if(!ccqa.activeWindow && ccqa.activeChildWindow) {
                            self.onInputCustomCss(self.editor.getValue(), e);
                        }
                    });
                },
                editorOptions: function() {
                    return {
                        fontFamily: "12px/normal 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace",
                        minLines: 5,
                        maxLines: Infinity,
                        useWorker: true,
                        highlightActiveLine: true,
                        showGutter: true,
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true,
                    }
                },
                selectorCompleter: function() {
                    return {
                        getCompletions: function getCompletions(editor, session, pos, prefix, callback) {
                            let list = [],
                                token = session.getTokenAt(pos.row, pos.column);

                            if (0 < prefix.length && 'selector'.match(prefix) && 'constant' === token.type) {
                                list = [{
                                    name: 'selector',
                                    value: 'selector',
                                    score: 1,
                                    meta: 'Elementor'
                                }];
                            }

                            callback(null, list);
                        }
                    }
                },
                updateElementorAceEditor: function(e) {
                    let currentPageView = elementor.panel.currentView.getCurrentPageView();
                    if( !ccqa.activeWindow && ccqa.activeChildWindow
                        && typeof(currentPageView.model) !== 'undefined'
                        && currentPageView.model.id === this.model.id
                        && currentPageView.activeSection === "section_custom_css"){
                        console.log(e);
                        let data = this.editor.getValue();
                        // check if ace editor of changed model is open.

                        let aceEditor = elementor.panel.currentView.getCurrentPageView().getControlViewByName('custom_css').editor;

                        // set $blockScrolling to Infinity to avoid Warnings
                        if(aceEditor.$blockScrolling !== Infinity) {
                            aceEditor.$blockScrolling = Infinity
                        }

                        // update ace editor value in editor
                        aceEditor.setValue(data);

                        // reset cursor position to avoid selection of whole css in editor
                        aceEditor.selection.moveTo(e.end.row, e.end.column);
                    }
                },
            });

            let CcqaColumnItemView = CcqaSectionItemView.extend({
                tagName: "div",
                className: "collumn-wrapper",
                template: '#ccqa-template',
            });

            let CcqaWidgetItemView = CcqaSectionItemView.extend({
                tagName: "div",
                className: "widget-wrapper",
                template: '#ccqa-template',
            });

            let CcqaSectionCollectionView = Backbone.Marionette.CollectionView.extend({
                tagName: "div",
                className: "loading-wrapper",
                childView: CcqaSectionItemView,
            });

            let customCssQickAccess = Backbone.Model.extend({
                activeWindow: true,
                activeChildWindow: false,
                loadingElement: new CcqaLoading(),
                elementorToggle: new CcqaElementorToggle(),
                /**
                 * Initialize the ccqa module
                 */
                initialize: function () {
                    this.setActiveWindowListener();
                    this.addPanelButton();
                    this.initCollection();
                },

                initCollection: function() {
                  this.listenTo(elementor, 'preview:loaded', this.addCollection)
                },
                addCollection: function() {
                    this.sectionView = new CcqaSectionCollectionView({ collection: elementor.elements});
                },
                setActiveWindowListener: function () {
                    let self = this;
                    window.addEventListener('focus', function() {
                        self.activeWindow = true;
                    });

                    window.addEventListener('blur', function() {
                        self.activeWindow = false;
                    });
                },

                addPanelButton: function() {
                    this.listenTo(elementor, 'panel:init', this.onPanelInit);
                },

                onPanelInit: function(){
                    this.initCustomCssToggle()
                },

                initCustomCssToggle: function() {

                    let toggle = $('#elementor-panel-footer-ccqa-toggle');

                    if (!toggle.length) {
                        this.elementorToggle.render();
                        this.listenTo(this.elementorToggle, 'all', this.toggleCcqaWindow);
                        this.elementorToggle.$el.insertAfter('#elementor-panel-footer-responsive');
                    }

                },
                toggleCcqaWindow: function() {
                    if(this.ccqaWindow) {
                        this.ccqaWindow.close();
                        delete this.ccqaWindow;

                    }else {
                        this.openCcqaWindow();
                    }
                },
                openCcqaWindow: function(){

                    this.ccqaWindow = window.open('');

                    this.ccqaBody = $(this.ccqaWindow.document.body);
                    this.ccqaHead = $(this.ccqaWindow.document.head);
                    this.ccqaBody.addClass('costum-css-quick-access ');

                    this.addCloseListeners();
                    this.addActiveWindowListeners();
                    this.addCss();
                    this.addCcqa();
                    this.addScripts();

                },
                addCloseListeners() {
                    let self = this;
                    $(window).on("beforeunload", function() {
                        if(self.ccqaWindowIsSet())
                            self.ccqaWindow.close();
                    });
                    $(self.ccqaWindow).on("beforeunload", function() {
                        delete self.ccqaWindow;
                        clearInterval(interval);
                    });
                },
                addCss: function() {
                    this.ccqaHead.append($('#ccqa-css').clone());
                    this.ccqaHead.append($('#elementor-icons-css').clone());
                },
                addCcqa: function() {
                    this.loadingElement.render();
                    this.ccqaBody.append(this.loadingElement.$el);
                },
                addScripts: function() {
                    let self = this;
                    self.loadScript('https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js', function(){
                        self.loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.5/ace.js?ver=1.2.5', function(){
                            self.loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.5/ext-language_tools.js', function(){
                                self.activateEditor();
                            });
                        });
                    });
                },
                loadScript: function(url, callback) {
                    let script = document.createElement('script');
                    script.onload = callback;
                    script.src = url;
                    this.ccqaWindow.document.head.appendChild(script);
                },
                addActiveWindowListeners: function () {
                    self = this;
                    if(!this.activeWindow){
                        activeChildWindow = true;
                    }
                    this.ccqaWindow.addEventListener('focus', function() {
                        self.activeChildWindow = true;
                    });

                    this.ccqaWindow.addEventListener('blur', function() {
                        self.activeChildWindow = false;
                    });
                },
                ccqaWindowIsSet: function() {
                    return (typeof(this.ccqaWindow) !== 'undefined');
                },
                activateEditor: function() {
                    let self = this;
                    interval = setInterval(function(){
                        if(typeof(self.ccqaWindow.ace) !== 'undefined'){
                            self.sectionView.render();
                            self.ccqaBody.append(self.sectionView.$el);
                            clearInterval(interval);
                            self.loadingElement.$el.css('display', 'none');
                        }
                    }, 10);
                },

            });

            window.ccqa = new customCssQickAccess;
        }
    );

})(jQuery);



