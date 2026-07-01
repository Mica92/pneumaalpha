// Curated bilingual (ES) corpus of Aquinas passages.
// Reference format: "Work · Locus" — kept short so the model can cite it back.
// Sources: public domain translations (Corpus Thomisticum, BAC editions in public domain).
// Extend this list freely; the ingestion pipeline is idempotent on (philosopher, reference, lang).

export type AquinasPassage = {
  work: string;
  reference: string;
  lang: "es";
  content: string;
};

export const AQUINAS_CORPUS: AquinasPassage[] = [
  {
    work: "Summa Theologiae",
    reference: "STh I, q.2, a.3 — Las cinco vías",
    lang: "es",
    content:
      "Se puede demostrar la existencia de Dios por cinco vías. La primera y más manifiesta parte del movimiento: todo lo que se mueve es movido por otro, y no cabe proceder al infinito, luego es necesario llegar a un primer motor que no sea movido por nadie, y éste todos entienden que es Dios. La segunda parte de la causa eficiente; la tercera, de lo posible y lo necesario; la cuarta, de los grados de perfección; la quinta, del gobierno de las cosas: vemos que cosas que carecen de conocimiento obran por un fin, lo cual no puede ocurrir sino dirigidas por alguien inteligente, y a este llamamos Dios.",
  },
  {
    work: "Summa Theologiae",
    reference: "STh I, q.2, a.1 — Si es evidente por sí que Dios existe",
    lang: "es",
    content:
      "Que Dios existe no es evidente para nosotros aunque lo sea en sí mismo, porque no conocemos la esencia de Dios. Por eso ha de demostrarse por lo que nos es más conocido, aunque menos noble por naturaleza: por sus efectos.",
  },
  {
    work: "Summa Theologiae",
    reference: "STh I, q.3, a.4 — En Dios se identifican esencia y ser",
    lang: "es",
    content:
      "En Dios la esencia no es distinta de su ser (esse). Todo aquello cuya esencia es distinta de su ser recibe el ser de otro; Dios es su propio ser subsistente. Ipsum esse subsistens: Dios no tiene ser, es el ser mismo.",
  },
  {
    work: "De Ente et Essentia",
    reference: "De Ente c.4 — Distinción entre esencia y ser en las criaturas",
    lang: "es",
    content:
      "En toda criatura la esencia es realmente distinta del acto de ser. La esencia responde a la pregunta ‘qué es’, el ser responde a ‘que es’. Sólo en Dios ambas coinciden; en las criaturas el ser es recibido, participado, limitado por la esencia que lo acoge.",
  },
  {
    work: "Summa Theologiae",
    reference: "STh I, q.13, a.5 — Analogía de los nombres divinos",
    lang: "es",
    content:
      "Los nombres que decimos de Dios y de las criaturas no se predican unívoca ni equívocamente, sino análogamente, según cierta proporción. Cuando decimos que Dios es sabio, no significamos lo mismo que en el hombre, pero tampoco algo enteramente distinto: significamos una perfección que en la criatura es participada y en Dios es su misma esencia.",
  },
  {
    work: "Summa Theologiae",
    reference: "STh I-II, q.94, a.2 — Primer precepto de la ley natural",
    lang: "es",
    content:
      "El primer precepto de la ley natural es: el bien ha de hacerse y buscarse; el mal ha de evitarse. Sobre él se fundan los demás preceptos: cuanto la razón práctica capta naturalmente como bien humano pertenece a los preceptos de la ley natural, como cosas a hacer o evitar.",
  },
  {
    work: "Summa Theologiae",
    reference: "STh I-II, q.90, a.4 — Definición de ley",
    lang: "es",
    content:
      "La ley es cierta ordenación de la razón al bien común, promulgada por quien tiene el cuidado de la comunidad. Cuatro elementos: ordenación racional, orientada al bien común, dada por autoridad legítima y promulgada.",
  },
  {
    work: "Summa Theologiae",
    reference: "STh I-II, q.91, a.2 — La ley natural es participación de la ley eterna",
    lang: "es",
    content:
      "La ley natural no es sino la participación de la ley eterna en la criatura racional. Por la luz de la razón natural discernimos lo bueno y lo malo; y esta luz misma es impronta en nosotros de la luz divina.",
  },
  {
    work: "Summa Theologiae",
    reference: "STh I, q.5, a.1 — El bien y el ser se identifican en la realidad",
    lang: "es",
    content:
      "El bien y el ser son realmente lo mismo, sólo se distinguen según la razón. Se llama bien a lo apetecible; y todo es apetecible en cuanto es perfecto, y todo es perfecto en cuanto está en acto. De modo que ser en acto y ser bueno vienen a coincidir.",
  },
  {
    work: "Summa Theologiae",
    reference: "STh I, q.75, a.4 — El alma no es el hombre entero",
    lang: "es",
    content:
      "El alma no es el hombre entero; mi alma no soy yo. El hombre es compuesto de alma y cuerpo; por eso la resurrección de la carne no es un añadido, sino la restitución de la persona completa.",
  },
  {
    work: "Summa Theologiae",
    reference: "STh I, q.76, a.1 — El alma es forma sustancial del cuerpo",
    lang: "es",
    content:
      "El principio intelectivo es forma del cuerpo humano. El alma no está en el cuerpo como un piloto en la nave; da al cuerpo su ser mismo, su vida, su unidad. Somos hilemórficos: materia informada por alma, no dos cosas yuxtapuestas.",
  },
  {
    work: "Summa Theologiae",
    reference: "STh I, q.79, a.8 — La razón procede por discurso",
    lang: "es",
    content:
      "Entender e ir discurriendo son distintos: entender es aprehender la verdad inteligible simplemente; razonar es proceder de lo uno conocido a otro, para llegar a conocer la verdad inteligible. La razón termina en el entendimiento, del que también procede.",
  },
  {
    work: "Summa Theologiae",
    reference: "STh I-II, q.55, a.4 — Definición de virtud",
    lang: "es",
    content:
      "La virtud es una buena cualidad de la mente por la que se vive rectamente, de la que nadie usa mal, y que Dios obra en nosotros sin nosotros (definición agustiniana que Tomás asume). Es hábito operativo bueno: perfecciona la potencia para obrar el bien con facilidad, prontitud y deleite.",
  },
  {
    work: "Summa Theologiae",
    reference: "STh I-II, q.57, a.4 — La prudencia, virtud del obrar",
    lang: "es",
    content:
      "La prudencia es recta razón de lo agible (recta ratio agibilium). No basta querer el bien; hay que discernir aquí y ahora los medios rectos. La prudencia manda al acto: consilium, iudicium, imperium.",
  },
  {
    work: "Summa Theologiae",
    reference: "STh II-II, q.1, a.2 — La fe como acto",
    lang: "es",
    content:
      "El acto de fe es un asentir por autoridad divina, no una mera opinión. Lo creído se recibe de Dios que revela, no se ve directamente. Por eso la fe es más cierta que la ciencia por parte de la causa, aunque menos evidente por parte del objeto.",
  },
  {
    work: "Summa contra Gentiles",
    reference: "SCG I, c.13 — La demostración por el movimiento",
    lang: "es",
    content:
      "Todo lo que se mueve es movido por otro. Nada pasa de la potencia al acto sino por algo en acto. No cabe proceder al infinito en los motores movidos; luego es necesario poner un primer motor inmóvil, que es Dios. Este es el argumento más eficaz de Aristóteles.",
  },
  {
    work: "Summa contra Gentiles",
    reference: "SCG III, c.25 — El fin último del hombre es la contemplación de Dios",
    lang: "es",
    content:
      "El fin último del hombre y de toda criatura intelectual es conocer a Dios. La bienaventuranza consiste esencialmente en un acto del entendimiento, no de la voluntad: en la visión, no en el amor, aunque el amor la acompañe inseparablemente.",
  },
  {
    work: "Summa Theologiae",
    reference: "STh I, q.14, a.1 — En Dios hay ciencia",
    lang: "es",
    content:
      "Dios se conoce a sí mismo por sí mismo, y en ese mismo conocerse conoce todas las cosas. Su ciencia no es discursiva ni sucesiva: en un solo acto simple abarca todo lo que es, fue y será, sin componer ni dividir.",
  },
  {
    work: "Summa Theologiae",
    reference: "STh I-II, q.109, a.2 — Necesidad de la gracia",
    lang: "es",
    content:
      "Aun para el bien natural que sobrepasa las fuerzas caídas, el hombre necesita el auxilio divino. La naturaleza no está destruida por el pecado, pero está herida en sus fuerzas. La gracia no destruye la naturaleza, sino que la sana y la eleva.",
  },
  {
    work: "Summa Theologiae",
    reference: "STh I, q.1, a.1 — Necesidad de la doctrina sagrada",
    lang: "es",
    content:
      "Fue necesario para la salvación humana que hubiese cierta doctrina según la revelación divina, además de las disciplinas filosóficas investigadas por la razón. Porque el hombre se ordena a Dios como a un fin que sobrepasa la comprensión de la razón.",
  },
  {
    work: "Quaestiones Disputatae de Veritate",
    reference: "De Veritate q.1, a.1 — Definición de verdad",
    lang: "es",
    content:
      "La verdad es la adecuación del entendimiento y la cosa (adaequatio intellectus et rei). El ente y lo verdadero se convierten: todo lo que es, en cuanto es, es cognoscible; y en cuanto está adecuado a un intelecto, es verdadero.",
  },
  {
    work: "Summa Theologiae",
    reference: "STh I-II, q.26, a.4 — Definición de amor",
    lang: "es",
    content:
      "Amar es querer el bien para alguien (velle alicui bonum). Distinguimos amor de concupiscencia —querer un bien para mí— y amor de amistad —querer el bien para el otro por él mismo. Este último es el amor propiamente dicho.",
  },
  {
    work: "Summa Theologiae",
    reference: "STh III, q.75, a.4 — Transubstanciación",
    lang: "es",
    content:
      "En el sacramento del altar, tras la consagración, la sustancia del pan se convierte en la sustancia del Cuerpo de Cristo; permanecen los accidentes (especies) sin sujeto. No es aniquilación ni cambio local, sino conversión sustancial, singular y única, obra del poder divino.",
  },
  {
    work: "Summa Theologiae",
    reference: "STh I, q.44, a.1 — Todo ente proviene de Dios",
    lang: "es",
    content:
      "Es necesario decir que todo lo que de cualquier modo es, viene de Dios. Porque si algo se halla en algo por participación, es preciso que sea causado en él por aquello a lo que le pertenece esencialmente. Sólo Dios es ser por esencia; todo lo demás es por participación.",
  },
  {
    work: "Compendium Theologiae",
    reference: "Comp. Theol. c.104 — La providencia y la libertad",
    lang: "es",
    content:
      "La providencia divina no suprime la libertad de las causas segundas, sino que la funda. Dios mueve a cada cosa según su naturaleza: a las necesarias, necesariamente; a las contingentes, contingentemente; a las libres, libremente. Ser movido por Dios no es coacción sino origen del propio obrar.",
  },
];
