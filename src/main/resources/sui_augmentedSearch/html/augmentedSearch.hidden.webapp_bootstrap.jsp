<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<template:addResources type="javascript" resources="app/augmented-search-ui-polyfills.js"/>
<template:addResources type="javascript" resources="app/augmented-search-ui-vendors.js"/>
<template:addResources type="javascript" resources="app/augmentedSearchUIApp.js"/>

<c:set var="_uuid_" value="${currentNode.identifier}"/>
<c:set var="nodeTypesMap" value="${currentNode.properties.nodeTypesMap.string}"/>
<c:set var="searchProvider" value="${currentNode.properties.searchProvider.string}"/>
<c:set var="resultsPerPage" value="${currentNode.properties.resultsPerPage.string}"/>
<c:set var="isFacetDisabled" value="${currentNode.properties.isFacetDisabled.string}"/>
<c:set var="isPagingDisabled" value="${currentNode.properties.isPagingDisabled.string}"/>
<c:set var="isSearchBoxDisabled" value="${currentNode.properties.isSearchBoxDisabled.string}"/>

<c:if test="${empty nodeTypesMap}">
    <c:set var="nodeTypesMap" value="[]"/>
</c:if>

<c:if test="${empty searchProvider}">
    <c:set var="searchProvider" value="{}"/>
</c:if>

<c:if test="${empty resultsPerPage}">
    <c:set var="resultsPerPage" value="null"/>
</c:if>

<c:if test="${empty isFacetDisabled}">
    <c:set var="isFacetDisabled" value="false"/>
</c:if>

<c:if test="${empty isPagingDisabled}">
    <c:set var="isPagingDisabled" value="false"/>
</c:if>

<c:if test="${empty isPagingDisabled}">
    <c:set var="isSearchBoxDisabled" value="false"/>
</c:if>

<c:set target="${moduleMap}" property="appId" value="AS_UI_WebApp_${fn:replace(_uuid_,'-','_')}" />
<script>
    const host_${moduleMap.appId} = window.location.protocol + '//' + window.location.host;
    let context_${moduleMap.appId} = {
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
            nodeTypesMap:${nodeTypesMap},
            searchProvider:${searchProvider},
            resultsPerPage:${resultsPerPage},
            isFacetDisabled:(/true/i).test(${isFacetDisabled}),
            isPagingDisabled:(/true/i).test(${isPagingDisabled})
        }
    }
</script>