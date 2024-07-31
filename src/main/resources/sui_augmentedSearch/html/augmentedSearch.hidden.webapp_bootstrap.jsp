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

<c:if test="${empty nodeTypesMap}">
    <c:set var="nodeTypesMap" value="[]"/>
</c:if>

<c:if test="${empty searchProvider}">
    <c:set var="searchProvider" value="{}"/>
</c:if>

<c:if test="${empty resultsPerPage}">
    <c:set var="resultsPerPage" value="null"/>
</c:if>

<c:set target="${moduleMap}" property="appId" value="AS_UI_WebApp_${fn:replace(_uuid_,'-','_')}" />
<c:set target="${moduleMap}" property="nodeTypesMap" value="${nodeTypesMap}" />
<c:set target="${moduleMap}" property="searchProvider" value="${searchProvider}" />
<c:set target="${moduleMap}" property="resultsPerPage" value="${resultsPerPage}" />