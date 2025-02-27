interface ChatMessageTemp {
  id: string;
  content: string, 
  timestamp: Date,
  service_id: string,
  sender: string,
  reciever: string,
  status: 'sent' | 'delivered' | 'read';
}
