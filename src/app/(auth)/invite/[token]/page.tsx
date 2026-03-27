export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="min-h-dvh flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="font-heading text-2xl font-bold text-forest">
          You&apos;ve been invited
        </h1>
        <p className="text-muted-foreground text-sm">
          Your partner wants to start a unit with you.
        </p>
        <a
          href={`/login?invite=${token}`}
          className="inline-block w-full py-2.5 rounded-lg bg-olive text-cream font-medium hover:bg-olive/90 transition-colors text-center"
        >
          Accept &amp; sign up
        </a>
      </div>
    </div>
  );
}
