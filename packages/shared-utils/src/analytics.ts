const MICROSOFT_CLARITY_TAG_BASE_URL = "https://www.clarity.ms/tag";
const MICROSOFT_CLARITY_PROJECT_ID_PATTERN = /^[A-Za-z0-9_-]+$/;
const GOOGLE_TAG_MANAGER_SCRIPT_BASE_URL =
  "https://www.googletagmanager.com/gtm.js";
const GOOGLE_TAG_MANAGER_NOSCRIPT_BASE_URL =
  "https://www.googletagmanager.com/ns.html";
const GOOGLE_TAG_MANAGER_CONTAINER_ID_PATTERN = /^GTM-[A-Z0-9]+$/;

export function normalizeMicrosoftClarityProjectId(
  projectId: string | null | undefined,
) {
  const normalized = projectId?.trim();

  if (!normalized) {
    return null;
  }

  return MICROSOFT_CLARITY_PROJECT_ID_PATTERN.test(normalized)
    ? normalized
    : null;
}

export function getMicrosoftClarityScriptUrl(projectId: string) {
  const normalized = normalizeMicrosoftClarityProjectId(projectId);

  if (!normalized) {
    throw new Error("Invalid Microsoft Clarity project ID.");
  }

  return `${MICROSOFT_CLARITY_TAG_BASE_URL}/${encodeURIComponent(normalized)}`;
}

export function getMicrosoftClarityScript(projectId: string) {
  const normalized = normalizeMicrosoftClarityProjectId(projectId);

  if (!normalized) {
    throw new Error("Invalid Microsoft Clarity project ID.");
  }

  return `
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments);};
      t=l.createElement(r);t.async=1;t.src="${MICROSOFT_CLARITY_TAG_BASE_URL}/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", ${JSON.stringify(normalized)});
  `;
}

export function normalizeGoogleTagManagerContainerId(
  containerId: string | null | undefined,
) {
  const normalized = containerId?.trim().toUpperCase();

  if (!normalized) {
    return null;
  }

  return GOOGLE_TAG_MANAGER_CONTAINER_ID_PATTERN.test(normalized)
    ? normalized
    : null;
}

export function getGoogleTagManagerScriptUrl(
  containerId: string,
  dataLayerName = "dataLayer",
) {
  const normalized = normalizeGoogleTagManagerContainerId(containerId);

  if (!normalized) {
    throw new Error("Invalid Google Tag Manager container ID.");
  }

  const params = new URLSearchParams({ id: normalized });
  if (dataLayerName !== "dataLayer") {
    params.set("l", dataLayerName);
  }

  return `${GOOGLE_TAG_MANAGER_SCRIPT_BASE_URL}?${params.toString()}`;
}

export function getGoogleTagManagerNoScriptUrl(
  containerId: string,
  dataLayerName = "dataLayer",
) {
  const normalized = normalizeGoogleTagManagerContainerId(containerId);

  if (!normalized) {
    throw new Error("Invalid Google Tag Manager container ID.");
  }

  const params = new URLSearchParams({ id: normalized });
  if (dataLayerName !== "dataLayer") {
    params.set("l", dataLayerName);
  }

  return `${GOOGLE_TAG_MANAGER_NOSCRIPT_BASE_URL}?${params.toString()}`;
}

export function getGoogleTagManagerScript(
  containerId: string,
  dataLayerName = "dataLayer",
) {
  const normalized = normalizeGoogleTagManagerContainerId(containerId);

  if (!normalized) {
    throw new Error("Invalid Google Tag Manager container ID.");
  }

  return `
    (function(w,d,s,l,i){
      w[l]=w[l]||[];
      w[l].push({"gtm.start": new Date().getTime(), event: "gtm.js"});
      var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),
        dl=l!="dataLayer" ? "&l="+l : "";
      j.async=true;
      j.src="${GOOGLE_TAG_MANAGER_SCRIPT_BASE_URL}?id="+i+dl;
      f.parentNode.insertBefore(j,f);
    })(window, document, "script", ${JSON.stringify(dataLayerName)}, ${JSON.stringify(normalized)});
  `;
}
