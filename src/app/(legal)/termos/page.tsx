import type { Metadata } from "next"
import Link from "next/link"
import { LegalDocument } from "@/components/legal-document"
import { LEGAL } from "@/lib/legal"

export const metadata: Metadata = { title: "Termos de uso" }

export default function TermsPage() {
  const { appName, site, contactEmail, lastUpdated, minimumAge } = LEGAL
  const mail = <a href={`mailto:${contactEmail}`}>{contactEmail}</a>

  return (
    <LegalDocument title="Termos de uso" updated={lastUpdated}>
      <p>
        Bem-vindo ao {appName} ({site}), um app para registrar sua leitura e ler junto com amigos em clubes do livro. Ao
        criar uma conta ou usar o app, você concorda com estes termos e com a{" "}
        <Link href="/privacidade">Política de privacidade</Link>. Se não concordar, não use o app.
      </p>

      <h2>O serviço</h2>
      <p>
        O {appName} permite manter uma biblioteca, fazer check-ins de leitura, acompanhar metas e sequências, participar de
        clubes, adicionar amigos, comentar e reagir. O app é oferecido gratuitamente e pode mudar, ganhar ou perder
        funções com o tempo.
      </p>

      <h2>Sua conta</h2>
      <ul>
        <li>Você precisa ter pelo menos {minimumAge} anos para usar o app.</li>
        <li>Use informações verdadeiras e mantenha sua senha em segredo. Você responde pelo que for feito na sua conta.</li>
        <li>
          Você pode excluir sua conta quando quiser, em <Link href="/conta">Perfil → Privacidade e conta</Link>.
        </li>
      </ul>

      <h2>O que você publica</h2>
      <p>
        Notas, fotos, comentários, nomes de clubes e outros conteúdos continuam sendo seus. Você nos dá uma permissão
        limitada, gratuita e revogável para guardar e mostrar esse conteúdo às pessoas que podem vê-lo no app (seus clubes
        e amigos), só para fazer o serviço funcionar. A permissão termina quando você apaga o conteúdo ou a conta.
      </p>
      <p>Você garante que tem o direito de publicar o que envia, inclusive fotos.</p>

      <h2>Regras de convivência</h2>
      <p>No {appName} não é permitido:</p>
      <ul>
        <li>publicar conteúdo ilegal, discurso de ódio, assédio, ameaças, conteúdo sexual explícito ou violento;</li>
        <li>expor dados pessoais de outras pessoas sem autorização;</li>
        <li>
          violar direitos autorais, por exemplo publicando capítulos ou páginas inteiras de livros (trechos curtos com
          citação são bem-vindos);
        </li>
        <li>fazer spam, criar contas falsas ou se passar por outra pessoa;</li>
        <li>tentar invadir, sobrecarregar, copiar em massa ou atrapalhar o funcionamento do app.</li>
      </ul>
      <p>
        Podemos remover conteúdo e suspender ou encerrar contas que desrespeitem estas regras, avisando você sempre que
        possível.
      </p>

      <h2>Clubes</h2>
      <p>
        Quem cria um clube é o dono e pode editar, convidar, escolher admins, remover membros, passar o clube para outra
        pessoa ou apagá-lo. Admins podem editar o clube e remover membros. Use esses poderes com respeito.
      </p>

      <h2>Disponibilidade e responsabilidade</h2>
      <p>
        Fazemos o possível para o app funcionar bem, mas ele é oferecido “no estado em que se encontra”, sem garantia de
        funcionamento ininterrupto ou livre de erros. Recomendamos baixar seus dados de vez em quando. Na medida
        permitida pela lei, não respondemos por danos indiretos, perda de dados ou lucros cessantes. Nada nestes termos
        limita direitos que você tenha pelo Código de Defesa do Consumidor.
      </p>

      <h2>Mudanças nos termos</h2>
      <p>
        Podemos atualizar estes termos. Se a mudança for relevante, avisaremos no app ou por e-mail antes de ela valer.
        Continuar usando o app depois disso significa que você aceita a nova versão.
      </p>

      <h2>Lei aplicável</h2>
      <p>
        Estes termos seguem as leis do Brasil. Fica eleito o foro do seu domicílio para resolver qualquer questão.
      </p>

      <h2>Contato</h2>
      <p>Dúvidas, denúncias ou pedidos: {mail}.</p>
    </LegalDocument>
  )
}
