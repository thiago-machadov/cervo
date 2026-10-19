import type { Metadata } from "next"
import Link from "next/link"
import { LegalDocument } from "@/components/legal-document"
import { LEGAL } from "@/lib/legal"

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: "Como o Cervo coleta, usa e protege seus dados, conforme a LGPD.",
  alternates: { canonical: "/privacidade" },
}

export default function PrivacyPage() {
  const { appName, site, contactEmail, lastUpdated, minimumAge } = LEGAL
  const mail = <a href={`mailto:${contactEmail}`}>{contactEmail}</a>

  return (
    <LegalDocument title="Política de privacidade" updated={lastUpdated}>
      <p>
        Esta política explica quais dados o {appName} ({site}) coleta, por que coleta, com quem compartilha e como você
        controla seus dados, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018, “LGPD”).
      </p>

      <h2>Quem cuida dos seus dados</h2>
      <p>
        O {appName} é o controlador dos dados tratados no app. Para qualquer assunto de privacidade, inclusive para
        exercer seus direitos, fale com a gente em {mail}.
      </p>

      <h2>O que coletamos</h2>
      <ul>
        <li>
          <strong>Conta:</strong> nome, e-mail e senha. A senha é guardada pelo nosso provedor de autenticação de forma
          criptografada (hash); nós nunca a vemos.
        </li>
        <li>
          <strong>Leitura:</strong> livros da sua biblioteca, páginas e minutos lidos, metas, notas dos check-ins, fotos de
          capa e fotos que você anexa aos check-ins.
        </li>
        <li>
          <strong>Social:</strong> clubes de que participa, comentários, reações, convites e amizades.
        </li>
        <li>
          <strong>Feedback:</strong> as mensagens que você nos envia e o navegador/aparelho usado, para ajudar a reproduzir
          problemas.
        </li>
        <li>
          <strong>Assinatura:</strong> plano, situação (teste, ativa, cancelada) e datas de cobrança. Os dados do cartão
          ficam com o Stripe; nós nunca os recebemos.
        </li>
        <li>
          <strong>Dados técnicos:</strong> endereço IP e registros de acesso (data, hora, página), gerados pela nossa
          infraestrutura para segurança e prevenção de abuso.
        </li>
      </ul>
      <p>Não coletamos dados sensíveis, não usamos seus dados para publicidade e não vendemos dados.</p>

      <h2>Para que usamos</h2>
      <ul>
        <li>
          Criar e manter sua conta, registrar sua leitura, calcular sequências, metas e rankings e mostrar sua atividade
          para seus clubes e amigos. Base legal: execução do contrato (art. 7º, V da LGPD).
        </li>
        <li>
          Enviar e-mails essenciais, como confirmação de cadastro e recuperação de senha. Base legal: execução do contrato.
        </li>
        <li>
          Manter o serviço seguro, evitar abuso e corrigir falhas. Base legal: legítimo interesse (art. 7º, IX) e
          cumprimento de obrigação legal, como a guarda de registros de acesso exigida pelo Marco Civil da Internet (art.
          7º, II).
        </li>
        <li>Melhorar o app a partir dos feedbacks que você envia. Base legal: legítimo interesse.</li>
      </ul>

      <h2>Quem vê o que você publica</h2>
      <ul>
        <li>
          <strong>Check-ins</strong> (páginas lidas, notas, fotos), comentários e reações aparecem para os membros dos
          clubes de que você participa e para seus amigos.
        </li>
        <li>
          <strong>Seu nome</strong> aparece para quem participa dos mesmos clubes e para quem abrir o link do seu perfil
          estando logado. Suas estatísticas e leituras só aparecem para amigos e membros dos seus clubes.
        </li>
        <li>
          <strong>Amizades</strong> só existem quando os dois lados aceitam.
        </li>
        <li>
          <strong>Clubes públicos</strong> aparecem na busca (nome, descrição e número de membros). Clubes privados, só
          por convite.
        </li>
        <li>
          <strong>Fotos de capa</strong> ficam em endereços públicos difíceis de adivinhar. As fotos dos check-ins só abrem
          para quem está logado.
        </li>
      </ul>

      <h2>Com quem compartilhamos</h2>
      <p>Usamos fornecedores (operadores) que tratam dados apenas para operar o app, sob contrato:</p>
      <ul>
        <li>
          <strong>Supabase</strong>: autenticação e banco de dados (servidores nos Estados Unidos).
        </li>
        <li>
          <strong>Cloudflare</strong>: hospedagem, rede, proteção contra ataques e armazenamento das imagens (rede
          global).
        </li>
        <li>
          <strong>Stripe</strong>: processamento dos pagamentos da assinatura, cobrança e recibos (Estados Unidos e
          Irlanda).
        </li>
        <li>
          <strong>Provedor de e-mail</strong> (ex.: Resend): envio dos e-mails de cadastro e senha (Estados Unidos).
        </li>
      </ul>
      <p>
        Por isso, seus dados podem ser transferidos para fora do Brasil. Essas transferências seguem o art. 33 da LGPD,
        com fornecedores que adotam cláusulas contratuais e medidas de segurança adequadas. Também podemos compartilhar
        dados quando a lei ou uma ordem judicial exigir.
      </p>

      <h2>Cookies e armazenamento no aparelho</h2>
      <p>
        Usamos apenas cookies essenciais, para manter você logado com segurança, e guardamos no seu aparelho preferências
        como o tema claro/escuro. Não usamos cookies de rastreamento nem de publicidade.
      </p>

      <h2>Por quanto tempo guardamos</h2>
      <ul>
        <li>Seus dados ficam guardados enquanto sua conta existir.</li>
        <li>
          Ao excluir a conta, apagamos na hora seu perfil, biblioteca, check-ins, fotos, comentários, reações, amizades e
          feedbacks. Livros que você cadastrou e que estão na biblioteca de outras pessoas continuam lá, sem o seu nome.
          Clubes que você criou passam para outro membro ou são apagados se só você participava.
        </li>
        <li>
          Cópias de segurança dos nossos fornecedores podem manter dados por até 30 dias antes de serem sobrescritas.
          Registros de acesso são mantidos pelo prazo exigido em lei (6 meses, Marco Civil da Internet).
        </li>
      </ul>

      <h2>Seus direitos</h2>
      <p>Pela LGPD (art. 18), você pode, a qualquer momento:</p>
      <ul>
        <li>
          <strong>Acessar e levar seus dados</strong>: baixe tudo em <Link href="/conta">Perfil → Privacidade e conta →
          Baixar meus dados</Link> (arquivo JSON).
        </li>
        <li>
          <strong>Corrigir dados</strong>: edite seu perfil e seus registros no app ou fale com a gente.
        </li>
        <li>
          <strong>Excluir seus dados</strong>: em <Link href="/conta">Perfil → Privacidade e conta → Excluir minha
          conta</Link>.
        </li>
        <li>
          <strong>Saber com quem compartilhamos</strong>, pedir informações sobre o tratamento e se opor a tratamentos
          baseados em legítimo interesse.
        </li>
      </ul>
      <p>
        Para qualquer pedido, escreva para {mail}. Respondemos em até 15 dias. Você também pode reclamar à Autoridade
        Nacional de Proteção de Dados (ANPD).
      </p>

      <h2>Segurança</h2>
      <p>
        Usamos conexões criptografadas (HTTPS), senhas com hash, acesso restrito ao banco de dados e bloqueio do acesso
        público direto às tabelas. Nenhum sistema é 100% seguro; se houver um incidente que possa afetar você, vamos
        avisar e comunicar a ANPD quando a lei exigir.
      </p>

      <h2>Idade mínima</h2>
      <p>
        O {appName} não é destinado a menores de {minimumAge} anos. Se você souber de uma conta de uma criança, avise em{" "}
        {mail} para removermos.
      </p>

      <h2>Mudanças nesta política</h2>
      <p>
        Podemos atualizar esta política. Quando a mudança for relevante, avisaremos no app ou por e-mail antes de ela
        valer. A data no topo mostra a versão atual.
      </p>
    </LegalDocument>
  )
}
