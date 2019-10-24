<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="utility" uri="http://www.jahia.org/tags/utilityLib" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="functions" uri="http://www.jahia.org/tags/functions" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ taglib prefix="query" uri="http://www.jahia.org/tags/queryLib" %>

<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>
<%--@elvariable id="currentResource" type="org.jahia.services.render.Resource"--%>
<%--@elvariable id="flowRequestContext" type="org.springframework.webflow.execution.RequestContext"--%>
<%--@elvariable id="out" type="java.io.PrintWriter"--%>
<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>
<%--@elvariable id="script" type="org.jahia.services.render.scripting.Script"--%>
<%--@elvariable id="scriptInfo" type="java.lang.String"--%>
<%--@elvariable id="url" type="org.jahia.services.render.URLGenerator"--%>
<%--@elvariable id="workspace" type="java.lang.String"--%>

<template:addResources type="javascript" resources="app/search-ui-academy-polyfills.js"/>
<template:addResources type="javascript" resources="app/search-ui-academy-vendors.js"/>
<template:addResources type="javascript" resources="app/searchUIAcademyApp.js"/>

<c:set var="appId" value="searchUIAcademyApp_${currentNode.identifier}"/>
<c:url value="${url.server}" var="entryPoint"/>

<div id="${appId}">Loading...</div>
<script>
    (function () {
        var context = {
            ctx: "${url.context}",
            language: "${currentResource.locale}",
            uiLanguage: "${renderContext.UILocale.language}",
            siteUUID: "${renderContext.site.identifier}",
            siteName: "${renderContext.site.name}",
            siteKey: "${renderContext.site.siteKey}",
            baseURL: "${entryPoint}"
        };
        window.searchUIAcademyApp("${appId}", context);
    })();
</script>