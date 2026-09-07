import {
    AddResources,
    buildModuleFileUrl,
    Island,
    jahiaComponent
} from '@jahia/javascript-modules-library';
import SearchApp from './SearchApp.client.jsx';

/**
 * View of sui:augmentedSearch — the replacement for the former
 * sui_augmentedSearch/html/augmentedSearch.jsp.
 *
 * The search UI is a fully client-side React application: it talks to the Augmented Search GraphQL
 * API from the browser and keeps its query state in the URL, so it is mounted as a client-only
 * island rather than rendered on the server.
 *
 * The wrapping element keeps the id the JSP used (`augmentedSearchUIApp_<node uuid>`): it is part of
 * the module's public DOM contract — integrators style and script against it.
 */
jahiaComponent(
    {
        componentType: 'view',
        nodeType: 'sui:augmentedSearch'
    },
    (props, {currentNode, renderContext, currentResource}) => {
        const site = renderContext.getSite();

        // Same values the JSP handed to window.augmentedSearchUIApp(); baseURL is still resolved in
        // the browser, where window.location is available.
        const dxContext = {
            ctx: renderContext.getRequest().getContextPath(),
            language: currentResource.getLocale().toString(),
            uiLanguage: renderContext.getUILocale().getLanguage(),
            siteUUID: site.getIdentifier(),
            siteName: site.getName(),
            siteKey: site.getSiteKey(),
            workspace: renderContext.getWorkspace()
        };

        return (
            <>
                {/* Vite extracts every stylesheet imported by the application into a single file. */}
                <AddResources type="css" resources={buildModuleFileUrl('dist/assets/style.css')}/>
                <div id={`augmentedSearchUIApp_${currentNode.getIdentifier()}`}>
                    <Island clientOnly component={SearchApp} props={{dxContext}} />
                </div>
            </>
        );
    }
);
