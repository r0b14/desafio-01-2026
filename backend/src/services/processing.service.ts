export const processPendingMessages = async () => {
  // 1. Buscar mensagens com status 'PENDING' limitadas (Worker Job)
  // const { data: messages } = await supabase.from('messages').select('*').eq('status', 'PENDING').limit(10);

  // 2. Iterar e chamar analyzeMessage(msg.content)

  // 3. Atualizar skills, intenções e emoções na db.
  // 4. Marcar mensagem como 'PROCESSED'

  console.log("Worker: Processando mensagens pendentes...");
};
