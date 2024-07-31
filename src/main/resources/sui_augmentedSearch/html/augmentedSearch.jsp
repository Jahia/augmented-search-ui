<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="utility" uri="http://www.jahia.org/tags/utilityLib" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>
<%--@elvariable id="currentResource" type="org.jahia.services.render.Resource"--%>
<%--@elvariable id="flowRequestContext" type="org.springframework.webflow.execution.RequestContext"--%>
<%--@elvariable id="out" type="java.io.PrintWriter"--%>
<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>
<%--@elvariable id="script" type="org.jahia.services.render.scripting.Script"--%>
<%--@elvariable id="scriptInfo" type="java.lang.String"--%>
<%--@elvariable id="url" type="org.jahia.services.render.URLGenerator"--%>
<%--@elvariable id="workspace" type="java.lang.String"--%>

<template:include view="hidden.webapp_bootstrap"/>

<div id="${moduleMap.appId}">Loading...</div>
<script>
    (function () {
        const host_${moduleMap.appId} = window.location.protocol + '//' + window.location.host;
        const context_${moduleMap.appId} = {
            ctx: "${url.context}",
            language: "${currentResource.locale}",
            uiLanguage: "${renderContext.UILocale.language}",
            siteUUID: "${renderContext.site.identifier}",
            siteName: "${renderContext.site.name}",
            siteKey: "${renderContext.site.siteKey}",
            workspace: "${renderContext.workspace}",
            baseURL: host_${moduleMap.appId},
            gqlServerUrl:host_${moduleMap.appId}+"/modules/graphql",
            webapp:{
                nodeTypesMap:${moduleMap.nodeTypesMap},
                searchProvider:${moduleMap.searchProvider},
                resultsPerPage:${moduleMap.resultsPerPage},
                resultsView:"Ggle"
            }
        };
        window.augmentedSearchUIApp("${moduleMap.appId}", context_${moduleMap.appId});
    })();
</script>
