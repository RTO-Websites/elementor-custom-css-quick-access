<script type="text/template" id="ccqa-template">
    <div class="title">
        <i class="eicon-sort-down"></i>
        <i class=" icon {{{settings.icon}}}" aria-hidden="true"></i>
        {{{settings.title}}}
    </div>
    <div class="content-wrapper">
        <span class="widget-id">Widget-ID: {{{id}}} </span>
        <span>ID: <input class="custom-id" value="{{{settings._element_id}}}"></span>
        <span>Class: <input class="custom-class" value="{{{settings.css_classes}}}"></span>
        <div class="custom-css autoExpand" id="editor-{{{id}}}"></div>
        <# if (settings.has_childs > 0) { #>
        <div class="inner"></div>
        <# } #>
    </div>
</script>

<script type="text/template" id="ccqa-loading">
    <p>Custom CSS is loading.</p>
</script>

<script type="text/template" id="ccqa-elementor-toggle">
    <i class="eicon-coding"></i>
</script>