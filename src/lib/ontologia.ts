/**
 * Explorador ontológico — catálogo curado de conceptos.
 *
 * Datos controlados (verificados) para los conceptos prioritarios. Para el resto
 * de palabras, la función de servidor usa el modelo con un prompt estricto que
 * respeta las mismas reglas. El catálogo es extensible y permite corregir sin
 * tocar la interfaz.
 */

export type Termino = {
  nombre: string;
  grafia: string;
  significado: string;
  distincion: string;
  ejemplo?: string;
};

export type Concepto = {
  id: string;
  palabra: string;
  definicion: string;
  griego: Termino[];
  latin: Termino[];
  sintesis: string;
  pregunta?: string;
};

export const ONTOLOGIA: Concepto[] = [
  {
    id: "amor",
    palabra: "amor",
    definicion:
      "En español, amor es una palabra amplia que puede designar distintos tipos de vínculo, afecto, deseo, cuidado, apego o compromiso. Usamos la misma palabra para experiencias que pueden parecer semejantes, aunque no tengan las mismas características.",
    griego: [
      {
        nombre: "Storgē",
        grafia: "στοργή",
        significado: "Afecto natural y arraigado, asociado sobre todo al vínculo entre familiares.",
        distincion: "El cariño que surge de la pertenencia y de una relación próxima, sin ser necesariamente fruto de una elección inicial.",
        ejemplo: "El cuidado espontáneo de una madre por su hijo, antes de toda deliberación.",
      },
      {
        nombre: "Philautía",
        grafia: "φιλαυτία",
        significado: "Amor hacia uno mismo.",
        distincion: "Distingue la relación que mantenemos con nosotros mismos de la que establecemos con los demás. No debe reducirse a egoísmo ni a autoestima: depende del contexto.",
        ejemplo: "Cuidar de uno mismo para poder cuidar de otros, frente a anteponer siempre el propio interés.",
      },
      {
        nombre: "Érōs",
        grafia: "ἔρως",
        significado: "Amor asociado al deseo, la atracción y el impulso hacia lo que se percibe como deseable.",
        distincion: "La dimensión del amor ligada al deseo y la atracción, sin suponer que toda relación amorosa se reduce a ella.",
        ejemplo: "La atracción inicial por una persona o la pasión por un ideal.",
      },
      {
        nombre: "Philía",
        grafia: "φιλία",
        significado: "Amistad, afecto y vínculos basados en la relación entre personas.",
        distincion: "Permite distinguir la amistad del deseo y del vínculo familiar; en Aristóteles se examina la amistad por placer, por utilidad y por virtud.",
        ejemplo: "La amistad que se sostiene por el bien que deseas al otro, no por lo que te aporta.",
      },
      {
        nombre: "Agápē",
        grafia: "ἀγάπη",
        significado: "Término que expresa amor o afecto y adquiere usos particulares según el contexto, sobre todo en textos religiosos y cristianos.",
        distincion: "No debe presentarse como una categoría universal de 'amor incondicional'; su sentido depende del uso textual.",
        ejemplo: "El amor al prójimo en un contexto de entrega, distinto del deseo de érōs.",
      },
      {
        nombre: "Prâgma",
        grafia: "πρᾶγμα",
        significado: "En general, asunto, hecho, acción o cosa, según el contexto.",
        distincion: "Su asociación con el 'amor maduro y duradero' es una clasificación divulgativa contemporánea, no una categoría antigua universalmente establecida.",
      },
    ],
    latin: [
      {
        nombre: "Amor",
        grafia: "amor",
        significado: "Afecto o amor en sentido amplio; su matiz depende del contexto.",
        distincion: "El término general del que derivan el español «amor» y otros romances.",
      },
      {
        nombre: "Amicitia",
        grafia: "amicitia",
        significado: "Amistad o vínculo amistoso.",
        distincion: "Distingue el afecto en sentido amplio de la relación de amistad, que supone reciprocidad y elección.",
      },
      {
        nombre: "Dilectio",
        grafia: "dilectio",
        significado: "Estima, elección o amor, con un matiz que depende del contexto textual.",
        distincion: "Añade la idea de una elección deliberada y de una estima fundada en el juicio.",
      },
      {
        nombre: "Caritas",
        grafia: "caritas",
        significado: "Afecto, estima y, en contextos cristianos, caridad o amor al prójimo y a Dios.",
        distincion: "Un amor que se expresa como entrega y cuidado, no como deseo ni como mera afinidad.",
      },
    ],
    sintesis:
      "La palabra «amor» reúne dimensiones distintas: afecto familiar, deseo, amistad, cuidado, vínculo personal, estima y compromiso. Los términos griegos y latinos permiten investigar algunas de estas dimensiones con más precisión, pero no constituyen una clasificación universal y exhaustiva de todas las formas de amar.",
    pregunta:
      "Cuando dices que amas a alguien, ¿te refieres principalmente al afecto, al deseo, a la amistad, al cuidado, al compromiso o a una combinación de estas dimensiones?",
  },
  {
    id: "libertad",
    palabra: "libertad",
    definicion:
      "En español, libertad designa tanto la ausencia de coerción externa como la capacidad de decidir por uno mismo. Puede referirse a la libertad política, a la libertad de acción o a una libertad interior.",
    griego: [
      {
        nombre: "Eleuthería",
        grafia: "ἐλευθερία",
        significado: "Libertad en sentido político y jurídico: la condición del libre frente al esclavo.",
        distincion: "La libertad como estado social y legal, no como sentimiento ni como capacidad interior.",
        ejemplo: "Poder hablar y desplazarse sin estar sometido a la voluntad de otro.",
      },
      {
        nombre: "Autárkeia",
        grafia: "αὐτάρκεια",
        significado: "Autosuficiencia; no depender de lo externo para el propio bien.",
        distincion: "Una libertad interior (estoica): ser dueño de sí al no depender de lo que no se controla.",
        ejemplo: "Mantener la calma ante una pérdida porque el propio bien no se cifra en lo perdido.",
      },
      {
        nombre: "Proaíresis",
        grafia: "προαίρεσις",
        significado: "Elección deliberada; la decisión que expresa el carácter tras deliberar.",
        distincion: "Distingue la libertad como capacidad de elegir reflexivamente, no como mera ausencia de obstáculos.",
        ejemplo: "Elegir un camino tras sopesarlo, y responder de esa elección.",
      },
    ],
    latin: [
      {
        nombre: "Libertas",
        grafia: "libertas",
        significado: "Libertad política y jurídica, la condición de no estar bajo la potestad de otro.",
        distincion: "La libertad como estatus, heredera directa de la eleuthería griega.",
      },
      {
        nombre: "Liberum arbitrium",
        grafia: "liberum arbitrium",
        significado: "Libre albedrío: la capacidad de la voluntad de elegir entre alternativas.",
        distincion: "La libertad como potencia de la voluntad, desarrollada sobre todo en la escolástica.",
      },
    ],
    sintesis:
      "«Libertad» reúne al menos tres dimensiones: la libertad política (eleuthería, libertas), la capacidad de elegir reflexivamente (proaíresis, liberum arbitrium) y una independencia interior frente a lo que no se controla (autárkeia). No siempre se refieren a lo mismo.",
    pregunta:
      "Cuando reivindicas tu libertad, ¿hablas de que nadie te coaccione, de poder elegir por ti mismo, o de no depender de lo que no controlas?",
  },
  {
    id: "justicia",
    palabra: "justicia",
    definicion:
      "Justicia designa dar a cada uno lo que le corresponde, tanto en el trato entre personas como en el orden de las instituciones. Puede referirse a una virtud personal o a una propiedad del orden social.",
    griego: [
      {
        nombre: "Dikaiosýnē",
        grafia: "δικαιοσύνη",
        significado: "La justicia como virtud del carácter: dar a cada uno lo suyo.",
        distincion: "La justicia como excelencia personal, distinta de la mera legalidad.",
        ejemplo: "Reconocer lo que debes a alguien aunque nadie te lo exija.",
      },
      {
        nombre: "Díkē",
        grafia: "δίκη",
        significado: "Justicia como orden, costumbre y retribución.",
        distincion: "La justicia como norma y orden de las cosas, con su dimensión de reparación y castigo.",
        ejemplo: "Que el daño sea reparado y el infractor responda por su acto.",
      },
      {
        nombre: "Isonomía",
        grafia: "ἰσονομία",
        significado: "Igualdad ante la ley.",
        distincion: "La justicia como igualdad formal: que la norma valga igual para todos.",
        ejemplo: "Que la misma regla se aplique al poderoso y al débil.",
      },
    ],
    latin: [
      {
        nombre: "Iustitia",
        grafia: "iustitia",
        significado: "Justicia como virtud y como orden.",
        distincion: "Reúne el sentido personal (dar a cada uno lo suyo) y el institucional.",
      },
      {
        nombre: "Aequitas",
        grafia: "aequitas",
        significado: "Equidad: la corrección de la ley en el caso concreto.",
        distincion: "La justicia que matiza la norma cuando su aplicación literal produciría una injusticia.",
        ejemplo: "Aplicar una regla con consideración de las circunstancias, no de forma mecánica.",
      },
    ],
    sintesis:
      "«Justicia» reúne la justicia como virtud de la persona (dikaiosýnē, iustitia), como orden y norma (díkē) y como equidad que corrige la ley en el caso (aequitas). Son dimensiones relacionadas, pero no idénticas.",
    pregunta:
      "¿Piensas la justicia como una virtud de la persona, como una propiedad de las instituciones, o como la corrección de la ley ante el caso concreto?",
  },
  {
    id: "verdad",
    palabra: "verdad",
    definicion:
      "Verdad designa la adecuación entre lo que se dice o piensa y lo que es. En español se usa tanto para la exactitud de una afirmación como para la autenticidad de una persona o de una vida.",
    griego: [
      {
        nombre: "Alḗtheia",
        grafia: "ἀλήθεια",
        significado: "Verdad como desvelamiento: lo que no está oculto.",
        distincion: "La verdad como aparición de lo que estaba encubierto, no solo como corrección de un enunciado.",
        ejemplo: "Comprender de pronto lo que una situación significaba, cuando se cae un autoengaño.",
      },
      {
        nombre: "Orthótes",
        grafia: "ὀρθότης",
        significado: "Rectitud o corrección de una afirmación.",
        distincion: "La verdad como exactitud de lo que se dice, frente a lo falso o erróneo.",
        ejemplo: "Que una descripción corresponda a los hechos.",
      },
      {
        nombre: "Epistḗmē",
        grafia: "ἐπιστήμη",
        significado: "Conocimiento estable y justificado, frente a la mera opinión (doxa).",
        distincion: "La verdad como saber fundado, no como creencia ocasional.",
        ejemplo: "Un conocimiento que puedes justificar, no solo afirmar.",
      },
    ],
    latin: [
      {
        nombre: "Veritas",
        grafia: "veritas",
        significado: "Verdad como adecuación de la mente a la cosa.",
        distincion: "La verdad como correspondencia entre pensamiento y realidad.",
      },
      {
        nombre: "Verum",
        grafia: "verum",
        significado: "Lo verdadero, lo que es el caso.",
        distincion: "Subraya el carácter objetivo de lo verdadero, distinto de lo meramente creído.",
      },
    ],
    sintesis:
      "«Verdad» reúne la verdad como desvelamiento (alḗtheia), como corrección de una afirmación (orthótes, veritas) y como conocimiento estable y justificado (epistḗmē). No siempre buscamos lo mismo al buscar la verdad.",
    pregunta:
      "Cuando buscas la verdad, ¿buscas que se te revele algo que estaba oculto, que tu afirmación sea correcta, o un conocimiento en el que puedas apoyarte?",
  },
  {
    id: "virtud",
    palabra: "virtud",
    definicion:
      "Virtud designa una excelencia del carácter o de la acción: una disposición estable a obrar bien. En español conserva ese sentido moral, pero también el de «poder» o «capacidad» de algo (la virtud de una planta o de un remedio).",
    griego: [
      {
        nombre: "Aretḗ",
        grafia: "ἀρετή",
        significado: "Excelencia: la realización plena de la función propia de algo.",
        distincion: "La virtud como excelencia, no solo moral: la virtud de un cuchillo es cortar bien; la de una persona, vivir bien.",
        ejemplo: "La excelencia de un oficio, antes que el cumplimiento de una regla.",
      },
      {
        nombre: "Phrónēsis",
        grafia: "φρόνησις",
        significado: "Prudencia práctica: el saber deliberar y juzgar qué hacer en cada caso.",
        distincion: "La virtud intelectual que orienta a las demás, distinta de la mera astucia.",
        ejemplo: "Saber cuándo hablar y cuándo callar, más que tener una regla fija.",
      },
    ],
    latin: [
      {
        nombre: "Virtus",
        grafia: "virtus",
        significado: "Valor, excelencia y fortaleza (derivada de vir, «varón»).",
        distincion: "La virtud con raíz en el coraje y la fuerza, antes de su sentido exclusivamente moral.",
      },
      {
        nombre: "Honestas",
        grafia: "honestas",
        significado: "Honradez; la cualidad de lo honorable.",
        distincion: "La virtud como honorabilidad y rectitud, no como utilidad.",
      },
    ],
    sintesis:
      "«Virtud» reúne la excelencia de una capacidad (aretḗ, virtus), el saber práctico de decidir bien (phrónēsis) y la honorabilidad del carácter (honestas). Su raíz antigua es la excelencia, no solo el deber.",
    pregunta:
      "¿Piensas la virtud como una capacidad que se ejercita, como un saber decidir, o como una cuestión de honor y rectitud?",
  },
  {
    id: "amistad",
    palabra: "amistad",
    definicion:
      "Amistad designa un vínculo de afecto y confianza entre personas que se eligen mutuamente. En español abarca desde la camaradería hasta la amistad profunda y desinteresada.",
    griego: [
      {
        nombre: "Philía",
        grafia: "φιλία",
        significado: "Amistad y afecto recíproco.",
        distincion: "En Aristóteles se distingue la amistad por placer, por utilidad y por virtud: no toda amistad es del mismo tipo.",
        ejemplo: "La amistad que desaparece cuando desaparece la utilidad, frente a la que se sostiene por el bien del otro.",
      },
    ],
    latin: [
      {
        nombre: "Amicitia",
        grafia: "amicitia",
        significado: "Amistad, alianza y afecto entre iguales.",
        distincion: "La amistad como vínculo elegido y recíproco, distinto del parentesco o del deseo.",
      },
      {
        nombre: "Benevolentia",
        grafia: "benevolentia",
        significado: "Buena voluntad; desear el bien al otro.",
        distincion: "La disposición de querer el bien ajeno, que puede existir sin reciprocidad plena.",
      },
    ],
    sintesis:
      "«Amistad» reúne el afecto recíproco (philía, amicitia) y la buena voluntad (benevolentia). La distinción más útil es entre la amistad fundada en el placer, en la utilidad o en la virtud.",
    pregunta:
      "¿Tu amistad se sostiene por lo que aporta, por el placer de la compañía o por el bien que deseas a la otra persona?",
  },
];

const BY_ID = new Map(ONTOLOGIA.map((c) => [c.id, c]));

export function conceptoByPalabra(palabra: string): Concepto | undefined {
  const norm = palabra.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return ONTOLOGIA.find((c) => c.palabra.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === norm);
}
