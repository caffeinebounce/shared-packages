interface SupabaseMfaChallengeClient {
  auth: {
    mfa: {
      challenge: (params: {
        factorId: string;
      }) => Promise<{ data: { id: string } | null; error: Error | null }>;
      verify: (params: {
        factorId: string;
        challengeId: string;
        code: string;
      }) => Promise<{ error: Error | null }>;
    };
  };
}

export interface VerifyMfaChallengeParams {
  factorId: string;
  code: string;
  challengeId?: string | null;
}

export async function createMfaChallenge(
  supabase: SupabaseMfaChallengeClient,
  factorId: string,
) {
  const { data, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId,
  });

  if (challengeError) {
    throw challengeError;
  }

  if (!data?.id) {
    throw new Error("Failed to create challenge");
  }

  return data.id;
}

export async function ensureMfaChallenge(
  supabase: SupabaseMfaChallengeClient,
  factorId: string,
  challengeId?: string | null,
) {
  if (challengeId) {
    return challengeId;
  }

  return createMfaChallenge(supabase, factorId);
}

export async function verifyMfaChallenge(
  supabase: SupabaseMfaChallengeClient,
  params: VerifyMfaChallengeParams,
) {
  const currentChallengeId = await ensureMfaChallenge(
    supabase,
    params.factorId,
    params.challengeId,
  );

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId: params.factorId,
    challengeId: currentChallengeId,
    code: params.code,
  });

  if (verifyError) {
    throw verifyError;
  }

  return currentChallengeId;
}
