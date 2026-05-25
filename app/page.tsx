import Link from "next/link";
import {
  BookOpen,
  ArrowRight,
  Clock,
  Sparkles,
  Calendar,
  Layers,
  Heart,
  CheckCircle,
  Users,
  Building,
  Star,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const painPoints = [
    {
      title: "Falta de Tempo",
      description:
        "Horas gastas preenchendo formulários repetitivos fora do horário escolar.",
      icon: Clock,
    },
    {
      title: "Planejamento Repetitivo",
      description:
        "Dificuldade de inovar e estruturar novos roteiros alinhados à BNCC toda semana.",
      icon: Layers,
    },
    {
      title: "Organização Difícil",
      description:
        "Planos espalhados por múltiplos arquivos, papéis e planilhas confusas.",
      icon: Calendar,
    },
    {
      title: "Sobrecarga Docente",
      description:
        "Esgotamento gerado pelo excesso de burocracia pedagógica diária.",
      icon: Heart,
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Escolha Disciplina e Série",
      description:
        "Selecione a série (Educação Infantil ao Ensino Médio) e o componente curricular desejado.",
    },
    {
      number: "02",
      title: "Informe Tema e Objetivos",
      description:
        "Diga qual assunto será trabalhado e adicione as metas específicas da sua aula.",
    },
    {
      number: "03",
      title: "Receba um Plano Estruturado",
      description:
        "Acesse um cronograma de atividades realista com BNCC, tarefas detalhadas e dicas didáticas.",
    },
  ];

  const benefits = [
    {
      title: "Economia de tempo",
      description:
        "Reduza em até 80% o tempo gasto com preenchimento burocrático de aulas.",
      icon: Clock,
    },
    {
      title: "Organização pedagógica",
      description:
        "Mantenha todos os seus planejamentos padronizados, organizados e acessíveis em um único lugar.",
      icon: BookOpen,
    },
    {
      title: "Planejamento estruturado",
      description:
        "Gere aulas estruturadas metodologicamente com introdução, desenvolvimento e avaliação claros.",
      icon: CheckCircle,
    },
    {
      title: "Mais foco no ensino",
      description:
        "Substitua a burocracia por mais atenção ao desenvolvimento real dos seus alunos em sala.",
      icon: Sparkles,
    },
  ];

  return (
    <div className="flex-grow flex flex-col justify-start relative overflow-hidden bg-gradient-to-b from-sky-50/70 via-background to-background">
      {/* Background decorations */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-sky-200/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-indigo-100/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* SEÇÃO 1 – HERO */}
      <section className="container max-w-6xl mx-auto px-4 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="flex justify-center">
          <Badge className="bg-sky-100/80 hover:bg-sky-100 text-sky-800 border-none py-1.5 px-4 rounded-full font-semibold text-xs flex items-center gap-1.5 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-sky-600" />
            <span>Desenvolvido para Professores e Escolas</span>
          </Badge>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] max-w-4xl mx-auto font-sans">
          Crie planos de aula em{" "}
          <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent font-black">
            minutos
          </span>
        </h1>

        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          PlanejaAI ajuda professores e escolas a criarem planejamentos
          organizados, claros e profissionais com mais agilidade. Menos tempo
          planejando, mais tempo ensinando.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
          <Link href="/planner">
            <Button
              size="lg"
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold h-12 px-8 rounded-xl shadow-md shadow-sky-600/10 flex items-center gap-2 group transition-all"
            >
              <span>Criar meu plano</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <a href="#como-funciona">
            <Button
              size="lg"
              variant="outline"
              className="border-slate-200 hover:border-sky-200 bg-white hover:bg-sky-50/20 text-slate-700 font-bold h-12 px-8 rounded-xl flex items-center gap-2"
            >
              <span>Ver como funciona</span>
            </Button>
          </a>
        </div>

        {/* SaaS Mockup Preview */}
        <div className="pt-10 max-w-4xl mx-auto">
          <div className="relative rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur-sm p-3 shadow-xl animate-in zoom-in-95 duration-1000">
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100">
              <span className="w-3 h-3 rounded-full bg-rose-400 block" />
              <span className="w-3 h-3 rounded-full bg-amber-400 block" />
              <span className="w-3 h-3 rounded-full bg-emerald-400 block" />
              <span className="text-[11px] text-slate-400 font-medium ml-4 select-none">
                planejaai.com/planner
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 text-left bg-slate-50/50 rounded-b-xl">
              <div className="md:col-span-1 border-r border-slate-100 pr-2 space-y-2 hidden md:block">
                <div className="h-7 bg-sky-100/50 text-sky-800 text-xs font-bold rounded-lg p-2 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Planos de Aula</span>
                </div>
                <div className="h-7 bg-transparent text-slate-500 text-xs font-semibold rounded-lg p-2 hover:bg-slate-100/60 transition-colors flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Calendário</span>
                </div>
                <div className="h-7 bg-transparent text-slate-500 text-xs font-semibold rounded-lg p-2 hover:bg-slate-100/60 transition-colors flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5" />
                  <span>Minha Escola</span>
                </div>
              </div>

              <div className="md:col-span-3 space-y-4">
                <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm space-y-2">
                  <div className="flex justify-between items-start">
                    <Badge className="bg-emerald-50 text-emerald-700 border-none font-semibold text-[10px]">
                      Ensino Fundamental
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-medium">
                      BNCC Alinhado
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-800">
                    Introdução às Frações com Recursos Visuais
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Compreender a representação das partes de um todo de forma
                    prática e lúdica através de círculos de papel colorido.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm text-center">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">
                      Tempo de Aula
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      50 Minutos
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm text-center">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">
                      Metodologia
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      Prática Guiada
                    </span>
                  </div>
                  <div className="p-3 bg-sky-50 rounded-lg border border-sky-100 shadow-sm text-center">
                    <span className="block text-[10px] text-sky-600 font-bold uppercase">
                      Inclusão TEA
                    </span>
                    <span className="text-xs font-bold text-sky-700">
                      Ativado 🧩
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2 – CONEXÃO COM A DOR */}
      <section className="bg-white py-20 border-t border-slate-100">
        <div className="container max-w-5xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge
              variant="outline"
              className="text-sky-600 border-sky-200/50 bg-sky-50/20 font-bold"
            >
              Desafios da Rotina
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              O planejamento não precisa ser um peso
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Planejar aulas pode consumir horas do seu dia. O PlanejaAI foi
              criado para simplificar esse processo e apoiar o trabalho
              pedagógico.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {painPoints.map((pain, idx) => {
              const Icon = pain.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-lg hover:border-sky-100 transition-all duration-300 space-y-4 text-left"
                >
                  <div className="h-10 h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-base leading-snug">
                    {pain.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {pain.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SEÇÃO 3 – COMO FUNCIONA */}
      <section
        id="como-funciona"
        className="py-20 bg-slate-50/40 border-t border-slate-100 scroll-mt-6"
      >
        <div className="container max-w-5xl mx-auto px-4 space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge
              variant="outline"
              className="text-sky-600 border-sky-200/50 bg-sky-50/20 font-bold"
            >
              Passo a Passo
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Simplicidade em apenas 3 etapas
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Um fluxo inteligente e intuitivo projetado para poupar seu tempo e
              gerar resultados incríveis.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 relative">
            {/* Connecting lines for desktop */}
            <div className="absolute top-1/3 left-[15%] right-[15%] h-0.5 border-t border-dashed border-slate-200 -z-10 hidden md:block" />

            {steps.map((step, idx) => {
              return (
                <div
                  key={idx}
                  className="bg-white p-8 rounded-2xl border border-slate-200/50 shadow-sm space-y-4 text-left flex flex-col justify-between hover:shadow-md transition-shadow relative"
                >
                  <span className="absolute top-4 right-6 text-3xl font-black text-sky-100 select-none">
                    {step.number}
                  </span>
                  <div className="h-9 w-9 rounded-full bg-sky-600 text-white text-xs font-bold flex items-center justify-center">
                    {step.number}
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-slate-800 text-base leading-snug">
                      {step.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SEÇÃO 4 – BENEFÍCIOS */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="container max-w-5xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge
              variant="outline"
              className="text-sky-600 border-sky-200/50 bg-sky-50/20 font-bold"
            >
              Vantagens Exclusivas
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Benefícios para o seu dia a dia
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Descubra como o PlanejaAI atua como um verdadeiro assistente
              pedagógico de suporte.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30 flex gap-4 items-start text-left hover:border-sky-100 transition-colors"
                >
                  <div className="p-3 rounded-xl bg-sky-50 text-sky-600 shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-base">
                      {benefit.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SEÇÃO 5 – PARA QUEM É */}
      <section className="py-20 bg-slate-50/40 border-t border-slate-100">
        <div className="container max-w-5xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge
              variant="outline"
              className="text-sky-600 border-sky-200/50 bg-sky-50/20 font-bold"
            >
              Público-Alvo
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Uma solução para cada necessidade
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Seja você um docente autônomo ou um gestor escolar, o PlanejaAI
              tem o formato ideal para apoiar sua rotina.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Block 1: Professors */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-8 shadow-sm text-left flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-100/30 rounded-full blur-xl pointer-events-none" />
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  Para Professores
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Praticidade, rapidez e flexibilidade para a sua rotina
                  pedagógica individual. Adapte aulas de forma cirúrgica e
                  organize sua rotina escolar em uma única tela.
                </p>
                <ul className="space-y-2 pt-2">
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-sky-600 shrink-0" />
                    <span>Apoio didático diário personalizado</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-sky-600 shrink-0" />
                    <span>Rapidez e liberdade de ajustes</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-sky-600 shrink-0" />
                    <span>Praticidade de download em PDF</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6">
                <Link href="/planner" className="w-full block">
                  <Button className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold h-11 rounded-lg">
                    Começar como Professor
                  </Button>
                </Link>
              </div>
            </div>

            {/* Block 2: Schools */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-8 shadow-sm text-left flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100/30 rounded-full blur-xl pointer-events-none" />
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Building className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  Para Escolas
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Padronize os roteiros da sua rede de ensino, acompanhe os
                  currículos adotados e ofereça uma infraestrutura de apoio
                  didático que combate a sobrecarga docente dos seus
                  professores.
                </p>
                <ul className="space-y-2 pt-2">
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span>Padronização e alinhamento de currículos</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span>Aumento expressivo da produtividade</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span>Apoio e acolhimento pedagógico integral</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6">
                <Link href="/pricing" className="w-full block">
                  <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold h-11 rounded-lg">
                    Conhecer Planos Escolares
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 6 – CONFIANÇA */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="container max-w-5xl mx-auto px-4 space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge
              variant="outline"
              className="text-sky-600 border-sky-200/50 bg-sky-50/20 font-bold"
            >
              Depoimentos e Parceria
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Desenvolvido para apoiar a rotina pedagógica
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Quem usa o PlanejaAI confirma o ganho de tranquilidade e a redução
              da burocracia no planejamento de suas aulas.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/20 text-left space-y-4">
              <div className="flex gap-1 text-amber-400">
                <Star className="h-4.5 w-4.5 fill-current" />
                <Star className="h-4.5 w-4.5 fill-current" />
                <Star className="h-4.5 w-4.5 fill-current" />
                <Star className="h-4.5 w-4.5 fill-current" />
                <Star className="h-4.5 w-4.5 fill-current" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                O PlanejaAI mudou minha rotina semanal. Costumava passar quase
                todo o meu domingo preenchendo as tabelas de aula. Agora consigo
                planejar com qualidade em 15 minutos.
              </p>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Ana Clara Silveira
                </p>
                <p className="text-[10px] text-slate-400">
                  Professora de História - Ensino Médio
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/20 text-left space-y-4">
              <div className="flex gap-1 text-amber-400">
                <Star className="h-4.5 w-4.5 fill-current" />
                <Star className="h-4.5 w-4.5 fill-current" />
                <Star className="h-4.5 w-4.5 fill-current" />
                <Star className="h-4.5 w-4.5 fill-current" />
                <Star className="h-4.5 w-4.5 fill-current" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                Adotamos a plataforma para unificar as práticas pedagógicas dos
                nossos professores de Ensino Fundamental. O ganho de padrão de
                qualidade e a velocidade foram excelentes.
              </p>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Roberto Antunes
                </p>
                <p className="text-[10px] text-slate-400">
                  Coordenador Pedagógico - Colégio Integração
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/20 text-left space-y-4">
              <div className="flex gap-1 text-amber-400">
                <Star className="h-4.5 w-4.5 fill-current" />
                <Star className="h-4.5 w-4.5 fill-current" />
                <Star className="h-4.5 w-4.5 fill-current" />
                <Star className="h-4.5 w-4.5 fill-current" />
                <Star className="h-4.5 w-4.5 fill-current" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                As sugestões metodológicas de acessibilidade para alunos
                especiais são incríveis. Consigo adaptar os exercícios do meu
                aluno autista em segundos com total qualidade pedagógica.
              </p>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Mariana Lopes
                </p>
                <p className="text-[10px] text-slate-400">
                  Professora de Geografia - AEE
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 7 – CTA FINAL */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky-950 via-slate-950 to-slate-999 opacity-80" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container max-w-4xl mx-auto px-4 relative space-y-8 z-10">
          <div className="flex justify-center">
            <div className="p-2 rounded-full bg-white/10 text-sky-400 backdrop-blur-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-2xl mx-auto leading-tight">
            Pronto para planejar com mais facilidade?
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Cadastre-se grátis hoje e comece a estruturar planejamentos
            profissionais alinhados à BNCC sem nenhuma complicação burocrática.
          </p>

          <div className="pt-4 flex justify-center">
            <Link href="/planner">
              <Button
                size="lg"
                className="bg-sky-500 hover:bg-sky-600 text-white font-bold h-12 px-10 rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-2 group transition-all"
              >
                <span>Começar agora</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Portal */}
      <section className="w-full bg-slate-950 text-slate-500 py-12 text-xs border-t border-slate-900 text-center">
        <div className="container max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-left">
            <p className="font-extrabold text-sm text-white">PlanejaAI</p>
            <p>© 2026 PlanejaAI. Todos os direitos reservados.</p>
          </div>
          <div className="flex gap-6 font-medium text-slate-400">
            <Link
              href="/pricing"
              className="hover:text-white transition-colors"
            >
              Preços
            </Link>
            <Link href="/setup" className="hover:text-white transition-colors">
              Configurações
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
