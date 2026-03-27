export default async function TripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Trip {id}</h1>
      <p className="text-sm text-muted-foreground">
        Trip details will be built in Phase 4.
      </p>
    </div>
  );
}
