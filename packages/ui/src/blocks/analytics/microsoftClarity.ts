const MICROSOFT_CLARITY_TAG_BASE_URL = "https://www.clarity.ms/tag";
const MICROSOFT_CLARITY_PROJECT_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

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
