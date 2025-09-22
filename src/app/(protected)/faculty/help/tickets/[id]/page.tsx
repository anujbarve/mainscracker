import TicketDetail from "@/components/help/ticket-detail";

type PageProps = {
  params: {
    id: string;
  };
};

export default function Page({ params }: PageProps) {
  return (
    <>
      <TicketDetail ticketId={params.id} />
    </>
  );
}
