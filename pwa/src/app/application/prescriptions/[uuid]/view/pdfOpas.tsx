import dayjs from '@/utils/dayjs.config';
import {
  calcABCN,
  calcMinutestoHours,
  calcNumberOfDays,
  calcNumberOfMonths,
  calcNumberOfWeeks,
} from "@/utils/functions.utils";
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View
} from "@react-pdf/renderer";

type PdfOpasProps = {
  owner: any;
  prescription?: any;
  isLoading?: boolean;
  mission: any;
  patient: any;
  principal: any;
  insurance: any;
  isPDFDownload?: boolean;
  isPDFViewer?: boolean;
  isOnePage?: boolean;
  cooperators: any[];
};

const dpi = 72;

const gap = 20;

Font.register({
  family: "Roboto",
  fonts: [
    { src: "/Roboto_Condensed/RobotoCondensed-Regular.ttf" },
    { src: "/Roboto_Condensed/RobotoCondensed-Bold.ttf", fontWeight: "bold" },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    padding: 20,
  },
  logo: {
    marginLeft: "8px",
    marginBottom: "6px",
    objectFit: "contain",
    maxWidth: "100px",
    maxHeight: "60px",
    width: "auto",
    height: "auto",
  },
  header: {
    flexDirection: "row",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    marginTop: 0,
  },
  column: {
    flex: 1,
    flexShrink: 1,
    flexGrow: 1,
    flexBasis: 0,
    marginHorizontal: gap / 2,
  },
  text: {
    fontFamily: "Roboto",
    fontSize: "9px",
    lineHeight: 1.4,
  },
  textBold: {
    fontWeight: "bold",
    fontSize: "9px",
    lineHeight: 1.4,
  },
  mainTitle: {
    fontFamily: "Roboto",
    fontWeight: "bold",
    fontSize: "16px",
    textAlign: "left",
    paddingLeft: "8px",
  },
  mainSubtitle: {
    fontSize: "8px",
    textAlign: "left",
    paddingTop: "4px",
    paddingLeft: "8px",
  },
  title: {
    fontFamily: "Roboto",
    fontSize: "12px",
    textAlign: "left",
    fontWeight: "bold",
    //textTransform: "uppercase",
  },
  signature: {
    fontSize: "9px",
    textAlign: "left",
  },
  separator: {
    width: "30px",
    height: "3px",
    backgroundColor: "#00c8d7",
    marginBottom: 5,
  },
  comment: {
    minHeight: 45,
    padding: "2 2",
    marginTop: 10,
    backgroundColor: "#F5F4F4",
    marginHorizontal: gap / 2,
  },
  caresContainer: {
    marginTop: "5px",
    borderTop: "1px solid black",
    borderLeft: "1px solid black",
    borderRight: "1px solid black",
  },
  careTitle: {
    padding: "4 4",
    borderBottom: "1px solid black",
    flexDirection: "row",
    fontWeight: "bold",
    fontSize: "9px",
  },
  care: {
    borderBottom: "1px solid black",
    flexDirection: "row",
    fontSize: "9px",
  },
  pagination: {
    position: "absolute",
    bottom: 20,
  },
  paginationText: {
    width: "100%",
    fontSize: "9px",
    textAlign: "center",
  },
  userSignature: {
    marginTop: 10,
    objectFit: "contain",
    maxWidth: "120px",
    maxHeight: "80px",
    width: "auto",
    height: "auto",
  },
});

const Separator = () => {
  return <View style={styles.separator}></View>;
};

const cares = [
  {
    act: "let. a ch. 1",
    description:
      " Evaluation des besoins du patient en collaboration avec le médecin.",
    display: false,
  },
  {
    act: "let. a ch. 2",
    description:
      "Conseils au patient ainsi qu'aux intervenants non professionnels pour les soins, l’administration des médicaments ou pour l’utilisation d’appareils médicaux, contrôles nécessaires",
    display: false,
  },
  {
    act: "let. a ch. 3",
    description:
      "Coordination des mesures et dispositions par des infirmières et infirmiers spécialisés en lien avec des complications dans les situations de soins complexes et instables.",
    display: false,
  },
  {
    act: "let. b ch. 1",
    description:
      "Contrôle des signes vitaux (tension artérielle, pouls, température, respiration, poids)",
    display: false,
  },
  {
    act: "let. b ch. 2",
    description:
      "Soins aux diabétiques (hémoglucotest, glycosurie, contrôle de l’état des pieds, éducation thérapeutique)",
    display: false,
  },
  {
    act: "let. b ch. 3",
    description: "Prélèvement pour examen de laboratoire.",
    display: false,
  },
  {
    act: "let. b ch. 4",
    description:
      "Mesures thérapeutiques pour la respiration (administration d’oxygène, inhalations, exercices respiratoires simples, aspiration)",
    display: false,
  },
  {
    act: "let. b ch. 5",
    description:
      "Pose de sondes et de cathéters, ainsi que les soins qui y sont liés.",
    display: false,
  },
  {
    act: "let. b ch. 6",
    description:
      "Soins en cas d’hémodialyse ou de dialyse péritonéale.",
    display: false,
  },
  {
    act: "let. b ch. 7",
    description:
      "Préparation et administration de médicaments ainsi que documentation des activités qui leur sont associées.",
    display: false,
  },
  {
    act: "let. b ch. 8",
    description:
      "Administration entérale ou parentérale de solutions nutritives.",
    display: false,
  },
  {
    act: "let. b ch. 9",
    description:
      "Surveillance de perfusions, de transfusions ou d’appareils servant au contrôle et au maintien des fonctions vitales(.....)",
    display: false,
  },
  {
    act: "let. b ch. 10",
    description:
      "Soins de plaies -rinçage, nettoyage et réfection de pansement . Soins pédicures pour les diabétiques.",
    display: false,
  },
  {
    act: "let. b ch. 11",
    description:
      "Soins en cas de troubles de l’évacuation urinaire ou intestinale, y compris la rééducation en cas d’incontinence",
    display: false,
  },
  {
    act: "let. b ch. 12",
    description:
      "Assistance pour des bains médicinaux partiels ou complets, application d’enveloppements, cataplasmes et fangos.",
    display: false,
  },
  {
    act: "let. b ch. 13",
    description:
      "Soins destinés à la mise en oeuvre au quotidien de la thérapie du médecin, tels que l’exercice de stratégies permettant de gérer la maladie et l’instruction pour la gestion des agressions, des angoisses et des idées paranoïaques.",
    display: false,
  },
  {
    act: "let. b ch. 14",
    description:
      "Soutien apporté aux malades psychiques dans des situations de crise, en particulier pour éviter les situations aiguës de mise en danger de soi-même ou d’autrui.",
    display: false,
  },
  {
    act: "let. c ch. 1",
    description:
      "Soins de base pour les patients dépendants (aide à la toilette, à l’habillage, au déshabillage, à l’alimentation, à la mobilisation, pose de bas de contention ....)",
    display: false,
  },
  {
    act: "let. c ch. 2",
    description:
      "Mesures destinées à surveiller et à soutenir les malades psychiques pour accomplir les actes ordinaires de la vie (...)",
    display: false,
  },
];

const translatePrescription = {
  "prescription": "Prescription initiale",
  "revaluation": "Réévaluation",
  "complementary": "Complément d'OPAS"
}

const translateCase = {
  disease: "Maladie",
  accident: "Accident",
  invalidity: "Invalidité"
}

const translatePeriod = {
  daily: "jour",
  weekly: "semaine",
  monthly: "mois",
  period: "période",
}

const PdfOpas = ({
  owner,
  prescription,
  mission,
  patient,
  principal,
  insurance,
  cooperators = [],
  isPDFDownload = true,
  isPDFViewer = false,
  isOnePage = false,
}: PdfOpasProps) => {

  const fileName = "Opas_" + dayjs().format("DD-MM-YYYY");

  console.log('cooperators', cooperators)
  const totalA = calcABCN(
    "A",
    prescription.content.services,
    mission.beginAt,
    mission.endAt
  );
  const totalAHours = calcMinutestoHours(totalA);
  const totalB = calcABCN(
    "B",
    prescription.content.services,
    mission.beginAt,
    mission.endAt
  );
  const totalBHours = calcMinutestoHours(totalB);
  const totalC = calcABCN(
    "C",
    prescription.content.services,
    mission.beginAt,
    mission.endAt
  );
  const totalCHours = calcMinutestoHours(totalC);

  let patientField = "";
  if (patient.gender === "homme") patientField += "Mr ";
  else patientField += "Mme ";
  patientField +=
    patient.lastname.toUpperCase() +
    " " +
    patient.firstname;
  if (patient.gender === "homme") patientField += " né le ";
  else patientField += " née le ";
  patientField +=
    dayjs(patient.birthdate).format("DD/MM/YYYY") +
    " (" +
    dayjs().diff(patient.birthdate, "years") +
    " ans)";
  patientField += "\n";
  patientField +=
    patient.address +
    ", " +
    patient.npa +
    " " +
    patient.city +
    ", " +
    patient.canton;
  patientField += "\n";
  patientField += "N° AVS : " + patient.avsNumber;
  if (patient.insuranceNumber) {
    patientField += "\n";
    patientField += "N° Assuré : " + patient.insuranceNumber;
  }

  let insuranceField = "";
  insuranceField += insurance.name;
  insuranceField += "\n";
  if (insurance.address) insuranceField += insurance.address + ", ";
  if (insurance.npa) insuranceField += insurance.npa + ", ";
  if (insurance.city) insuranceField += insurance.city + ", ";
  insuranceField += "\n";
  if (insurance.gln) {
    insuranceField += "GLN : " + insurance.gln;
    insuranceField += "\n";
  }

  let doctorField = "";
  doctorField += principal.name;
  doctorField += "\n";
  doctorField += "RCC : " + principal.rcc;
  doctorField += "\n";
  if (principal.address) doctorField += principal.address + ", ";
  if (principal.npa) doctorField += principal.npa + ", ";
  if (principal.city) doctorField += principal.city + ", ";

  doctorField += "\n";
  if (principal.phone) doctorField += "Tél. : " + principal.phone;

  let nurseField = "";
  nurseField += owner.lastname + " " + owner.firstname;
  nurseField += "\n";
  nurseField += "RCC : " + owner.rcc;
  nurseField += "\n";
  nurseField += "Tél. : " + owner.mobile;
  nurseField += "\n";
  nurseField += "Email : " + owner.email;
  nurseField += "\n";
  nurseField += owner.address;
  nurseField += "\n";
  nurseField += owner.npa + " " + owner.city;

  const displayedPartners = () => {
    let displayed = "";
    cooperators.forEach((c) => {
      displayed += c.firstname + " " + c.lastname;
      displayed += "\n";
      displayed += "RCC: " + c.rcc;
      displayed += "\n";
    });
    return displayed;
  };

  const displayedCares = () => {
    let displayed = [...cares];

    prescription.content.services.forEach((service) => {
      let index = cares.findIndex((obj) => obj.act === service.opas);
      if (displayed[index].display === false) {
        displayed[index].display = true;
        displayed[index].totalTime = calcTotalServiceTime(service);
        displayed[index].frequency = service.frequency;
        displayed[index].periodicity = service.periodicity;
      } else if (
        displayed[index].totalTime < calcTotalServiceTime(service)
      ) {
        displayed[index].totalTime = calcTotalServiceTime(service);
        displayed[index].frequency = service.frequency;
        displayed[index].periodicity = service.periodicity;
      }
    });

    console.log("displayed", displayed)

    return displayed.filter((c) => c.display === true);
  };

  const groupedServices = (groupBy) => {
    return prescription.content.services.filter((f) => f.category === groupBy);
  };

  const calcTotalServiceTime = (service) => {
    if (service.periodicity === "period")
      return Number(service.duration) * Number(service.frequency);
    if (service.periodicity === "daily")
      return (
        Number(service.duration) *
        Number(service.frequency) *
        calcNumberOfDays(mission.beginAt, mission.endAt)
      );
    if (service.periodicity === "weekly")
      return (
        Number(service.duration) *
        Number(service.frequency) *
        calcNumberOfWeeks(mission.beginAt, mission.endAt)
      );
    if (service.periodicity === "monthly")
      return (
        Number(service.duration) *
        Number(service.frequency) *
        calcNumberOfMonths(mission.beginAt, mission.endAt)
      );
  };

  return (
    <Document>
      <Page
        size="A4"
        style={styles.page}
        dpi={dpi}
        wrap
        debug={false}
      >
        <Image
          style={styles.logo}
          cache={true}
          src="/logo-cohealth.png"
        />
        <View style={styles.header}>
          <View>
            <Text style={styles.mainTitle}>
              Prescription médicale pour soins à domicile
            </Text>
            <Text style={styles.mainSubtitle}>
              (Selon article 7, al.2 OPAS)
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <View
              style={[
                styles.row,
                {
                  alignItems: "center",
                  marginTop: 8,
                },
              ]}
            >
              <Text style={styles.title}>
                {mission.patient.gender === "homme"
                  ? "Patient"
                  : "Patiente"}
              </Text>
            </View>
            <Separator />
            <Text style={styles.text}>{patientField}</Text>
          </View>
          <View style={styles.column}>
            <View
              style={[
                styles.row,
                {
                  alignItems: "center",
                  marginTop: 8,
                },
              ]}
            >
              <Text style={styles.title}>Assurance</Text>
            </View>
            <Separator />
            <Text style={styles.text}>{insuranceField}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <View
              style={[
                styles.row,
                {
                  alignItems: "center",
                  marginTop: 8,
                },
              ]}
            >
              <Text style={styles.title}>
                Prescription médicale
              </Text>
            </View>
            <Separator />
            <View
              style={{
                ...styles.row,
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  ...styles.text,
                  fontWeight: "bold",
                }}
              >
                {translatePrescription[prescription.content.type]}
              </Text>
              <Text
                style={{
                  ...styles.text,
                  fontWeight: "bold",
                }}
              >
                Période :{" "}
                {dayjs(mission.beginAt).format("L")} au{" "}
                {dayjs(mission.endAt).format("L") + " "}(
                {calcNumberOfDays(
                  mission.beginAt,
                  mission.endAt
                )}{" "}
                jours)
              </Text>
              <Text
                style={{
                  ...styles.text,
                  fontWeight: "bold",
                }}
              >
                Cas : {translateCase[prescription.content.case]}
              </Text>
              {prescription.content.disability === "oui" && (
                <Text
                  style={{
                    ...styles.text,
                    fontWeight: "bold",
                  }}
                >
                  Au bénifice d’une allocation pour
                  impotent
                </Text>
              )}
            </View>
          </View>
        </View>

        {prescription.content.diagnosticNurse.length > 0 && (
          <View style={styles.comment}>
            <Text
              style={{
                ...styles.text,
                whiteSpace: "pre-line",
                paddingHorizontal: 2,
                paddingVertical: 2,
              }}
            >
              {prescription.content.diagnosticNurse}
            </Text>
          </View>
        )}

        <View style={styles.comment}>
          <Text
            style={{
              ...styles.text,
              whiteSpace: "pre-line",
              paddingHorizontal: 2,
              paddingVertical: 2,
            }}
          >
            (à remplir par le médecin pour des mesures
            médico-déléguées uniquement)
            {"\n"}
            {prescription.content.diagnosticDoctor}
          </Text>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <View
              style={[
                styles.row,
                {
                  alignItems: "center",
                  marginTop: 8,
                },
              ]}
            >
              <Text style={styles.title}>
                Soins infirmiers
              </Text>
            </View>
            <Separator />
            <View style={styles.caresContainer}>
              {displayedCares().map((displayedCare, index) => (
                <View style={styles.care} key={"care-" + index}>
                  <Text style={{ width: 80, padding: 5 }}>
                    {displayedCare.act}
                  </Text>
                  <Text
                    style={{
                      width: "100%",
                      padding: 5,
                      borderLeft: "1px solid black",
                    }}
                  >
                    {displayedCare.description}
                  </Text>
                  <Text
                    style={{
                      width: 100,
                      borderLeft: "1px solid black",
                      textAlign: "center",
                      paddingTop: 5,
                      paddingBottom: 5,
                    }}
                  >
                    {displayedCare.frequency}x /{" "}
                    {translatePeriod[displayedCare.periodicity]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: "5px",
          }}
        >
          <View style={{ marginHorizontal: gap / 2 }}>
            <Text style={styles.text}>
              Total A (Évaluation et conseils) : {totalA} min.
              {totalA !== 0 && " (" + totalAHours + "h)"}
              {"\n"}
              Total B (Examens et traitements) : {totalB} min.
              {totalB !== 0 && " (" + totalBHours + "h)"}
              {"\n"}
              Total C (Soins de base) : {totalC} min.
              {totalC !== 0 && " (" + totalCHours + "h)"}
            </Text>
          </View>
          <View style={{ marginHorizontal: gap / 2 }}>
            <Text style={styles.textBold}>
              Total : {totalA + totalB + totalC} min. (
              {Math.round(
                ((totalA + totalB + totalC) * 100) / 60
              ) / 100}{" "}
              h)
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <View
              style={[
                styles.row,
                {
                  alignItems: "center",
                  marginTop: 8,
                },
              ]}
            >
              <Text style={styles.title}>Médecin</Text>
            </View>
            <Separator />
            <Text style={styles.text}>{doctorField}</Text>
          </View>
          <View style={styles.column}>
            <View
              style={[
                styles.row,
                {
                  alignItems: "center",
                  marginTop: 8,
                },
              ]}
            >
              <Text style={styles.title}>Infirmier</Text>
            </View>
            <Separator />
            <Text style={styles.text}>{nurseField}</Text>
          </View>

          {mission.owners.length !== 0 && (
            <View style={styles.column}>
              <View
                style={[
                  styles.row,
                  {
                    alignItems: "center",
                    marginTop: 8,
                  },
                ]}
              >
                <Text style={styles.title}>
                  Autres prestataires
                </Text>
              </View>
              <Separator />
              <Text style={styles.text}>
                {displayedPartners()}
              </Text>
            </View>
          )}
        </View>

        <View style={{ ...styles.row, marginTop: 10 }}>
          <View style={styles.column}>
            <Text style={styles.signature}>
              Date et signature du médecin
            </Text>
            {principal && prescription.signedAt && (
              <>
                <Text style={styles.signature}>
                  Le : {dayjs(prescription.signedAt).format("L")}
                </Text>
                <Image
                  style={styles.userSignature}
                  cache={true}
                  src={principal.user.signature.contentUrl}
                />
              </>
            )}
          </View>
          <View style={styles.column}>
            <Text style={styles.signature}>
              Signature de l'infirmier
            </Text>
            {owner && owner.signature && (
              <Image
                style={styles.userSignature}
                cache={true}
                src={owner.signature.contentUrl}
              />
            )}
          </View>
          {/* {mission.ownersDetailed.length > 0 &&
                            <View style={styles.column}>
                            </View>
                        } */}
        </View>
      </Page>

      {!isOnePage && (
        <Page
          size="A4"
          style={styles.page}
          dpi={dpi}
          wrap
          debug={false}
        >
          <Image
            style={styles.logo}
            cache={true}
            src="/logo-cohealth.png"
          />
          <View style={styles.header}>
            <View>
              <Text style={styles.mainTitle}>
                Prescription médicale pour soins à domicile
              </Text>
              <Text style={styles.mainSubtitle}>
                (Selon article 7, al.2 OPAS)
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <View
                style={[
                  styles.row,
                  {
                    alignItems: "center",
                    marginTop: 8,
                  },
                ]}
              >
                <Text style={styles.title}>
                  {mission.patient.gender === "homme"
                    ? "Patient"
                    : "Patiente"}
                </Text>
              </View>
              <Separator />
              <Text style={styles.text}>{patientField}</Text>
            </View>
            <View style={styles.column}>
              <View
                style={[
                  styles.row,
                  {
                    alignItems: "center",
                    marginTop: 8,
                  },
                ]}
              >
                <Text style={styles.title}>Assurance</Text>
              </View>
              <Separator />
              <Text style={styles.text}>
                {insuranceField}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View
                  style={[
                    styles.row,
                    {
                      alignItems: "center",
                      marginTop: 8,
                    },
                  ]}
                >
                  <Text style={styles.title}>
                    Soins infirmiers
                  </Text>
                </View>
              </View>
              <Separator />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.column}>
              <View
                style={{
                  ...styles.row,
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    ...styles.text,
                    fontWeight: "bold",
                  }}
                >
                  {translatePrescription[prescription.content.type]}
                </Text>
                <Text
                  style={{
                    ...styles.text,
                    fontWeight: "bold",
                  }}
                >
                  Période :{" "}
                  {dayjs(mission.beginAt).format("L")} au{" "}
                  {dayjs(mission.endAt).format("L") + " "}
                  (
                  {calcNumberOfDays(
                    mission.beginAt,
                    mission.endAt
                  )}{" "}
                  jours)
                </Text>
                <Text
                  style={{
                    ...styles.text,
                    fontWeight: "bold",
                  }}
                >
                  Cas : {translateCase[prescription.content.case]}
                </Text>
                {prescription.content.disability === "oui" && (
                  <Text
                    style={{
                      ...styles.text,
                      fontWeight: "bold",
                    }}
                  >
                    Au bénifice d’une allocation pour impotent
                  </Text>
                )}
              </View>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.column}>
              <View style={{ marginTop: "9px" }}>
                <View
                  style={{
                    padding: "0 0",
                    flexDirection: "row",
                    fontSize: "9px",
                  }}
                >
                  <Text
                    style={{
                      width: 100,
                      paddingLeft: 5,
                    }}
                  >
                    OPAS *
                  </Text>
                  <Text
                    style={{
                      width: 90,
                      paddingLeft: 5,
                      textAlign: "center",
                    }}
                  >
                    Code *
                  </Text>
                  <Text
                    style={{
                      width: "100%",
                      paddingLeft: 5,
                      paddingRight: 15,
                    }}
                  >
                    Prestation
                  </Text>
                  <Text
                    style={{
                      width: 100,
                      textAlign: "center",
                    }}
                  >
                    Durée
                  </Text>
                  <Text
                    style={{
                      width: 140,
                      textAlign: "center",
                    }}
                  >
                    Fréquence
                  </Text>
                  <Text
                    style={{
                      width: 120,
                      textAlign: "center",
                    }}
                  >
                    Durée totale
                  </Text>
                </View>
              </View>

              {groupedServices("A").length > 0 && (
                <View style={styles.caresContainer}>
                  <View>
                    <Text style={styles.careTitle}>
                      A / Evaluation et conseils
                    </Text>
                  </View>
                  {groupedServices("A").map((s, index) => (
                    <View
                      style={styles.care}
                      key={"serviceA-" + index}
                    >
                      <Text
                        style={{
                          width: 110,
                          paddingLeft: 5,
                          paddingTop: 5,
                          paddingBottom: 5,
                        }}
                      >
                        {s.opas}
                      </Text>
                      <Text
                        style={{
                          width: 90,
                          paddingLeft: 5,
                          paddingTop: 5,
                          paddingBottom: 5,
                          borderLeft:
                            "1px solid black",
                          textAlign: "center",
                        }}
                      >
                        {s.actNumber}
                      </Text>
                      <Text
                        style={{
                          width: "100%",
                          paddingLeft: 5,
                          paddingRight: 15,
                          paddingTop: 5,
                          paddingBottom: 5,
                          borderLeft:
                            "1px solid black",
                        }}
                      >
                        {s.name}
                      </Text>
                      <Text
                        style={{
                          width: 110,
                          borderLeft:
                            "1px solid black",
                          textAlign: "center",
                          paddingTop: 5,
                          paddingBottom: 5,
                        }}
                      >
                        {s.duration}
                      </Text>
                      <Text
                        style={{
                          width: 140,
                          borderLeft:
                            "1px solid black",
                          textAlign: "center",
                          paddingTop: 5,
                          paddingBottom: 5,
                        }}
                      >
                        {s.frequency}x /{" "}
                        {translatePeriod[s.periodicity]}
                      </Text>
                      <Text
                        style={{
                          width: 120,
                          borderLeft:
                            "1px solid black",
                          textAlign: "center",
                          paddingTop: 5,
                          paddingBottom: 5,
                        }}
                      >
                        {calcTotalServiceTime(s)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              {groupedServices("B").length > 0 && (
                <View style={styles.caresContainer}>
                  <View>
                    <Text style={styles.careTitle}>
                      B / Examens et traitements
                    </Text>
                  </View>
                  {groupedServices("B").map((s, index) => (
                    <View
                      style={styles.care}
                      key={"serviceB-" + index}
                    >
                      <Text
                        style={{
                          width: 110,
                          paddingLeft: 5,
                          paddingTop: 5,
                          paddingBottom: 5,
                        }}
                      >
                        {s.opas}
                      </Text>
                      <Text
                        style={{
                          width: 90,
                          paddingLeft: 5,
                          paddingTop: 5,
                          paddingBottom: 5,
                          borderLeft:
                            "1px solid black",
                          textAlign: "center",
                        }}
                      >
                        {s.actNumber}
                      </Text>
                      <Text
                        style={{
                          width: "100%",
                          paddingLeft: 5,
                          paddingRight: 15,
                          paddingTop: 5,
                          paddingBottom: 5,
                          borderLeft:
                            "1px solid black",
                        }}
                      >
                        {s.name}
                      </Text>
                      <Text
                        style={{
                          width: 110,
                          borderLeft:
                            "1px solid black",
                          textAlign: "center",
                          paddingTop: 5,
                          paddingBottom: 5,
                        }}
                      >
                        {s.duration}
                      </Text>
                      <Text
                        style={{
                          width: 140,
                          borderLeft:
                            "1px solid black",
                          textAlign: "center",
                          paddingTop: 5,
                          paddingBottom: 5,
                        }}
                      >
                        {s.frequency}x /{" "}
                        {translatePeriod[s.periodicity]}
                      </Text>
                      <Text
                        style={{
                          width: 120,
                          borderLeft:
                            "1px solid black",
                          textAlign: "center",
                          paddingTop: 5,
                          paddingBottom: 5,
                        }}
                      >
                        {calcTotalServiceTime(s)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              {groupedServices("C").length > 0 && (
                <View style={styles.caresContainer}>
                  <View>
                    <Text style={styles.careTitle}>
                      C / Soins de base
                    </Text>
                  </View>
                  {groupedServices("C").map((s, index) => (
                    <View
                      style={styles.care}
                      key={"serviceC-" + index}
                    >
                      <Text
                        style={{
                          width: 110,
                          paddingLeft: 5,
                          paddingTop: 5,
                          paddingBottom: 5,
                        }}
                      >
                        {s.opas}
                      </Text>
                      <Text
                        style={{
                          width: 90,
                          paddingLeft: 5,
                          paddingTop: 5,
                          paddingBottom: 5,
                          borderLeft:
                            "1px solid black",
                          textAlign: "center",
                        }}
                      >
                        {s.actNumber}
                      </Text>
                      <Text
                        style={{
                          width: "100%",
                          paddingLeft: 5,
                          paddingRight: 15,
                          paddingTop: 5,
                          paddingBottom: 5,
                          borderLeft:
                            "1px solid black",
                        }}
                      >
                        {s.name}
                      </Text>
                      <Text
                        style={{
                          width: 110,
                          borderLeft:
                            "1px solid black",
                          textAlign: "center",
                          paddingTop: 5,
                          paddingBottom: 5,
                        }}
                      >
                        {s.duration}
                      </Text>
                      <Text
                        style={{
                          width: 140,
                          borderLeft:
                            "1px solid black",
                          textAlign: "center",
                          paddingTop: 5,
                          paddingBottom: 5,
                        }}
                      >
                        {s.frequency}x /{" "}
                        {translatePeriod[s.periodicity]}
                      </Text>
                      <Text
                        style={{
                          width: 120,
                          borderLeft:
                            "1px solid black",
                          textAlign: "center",
                          paddingTop: 5,
                          paddingBottom: 5,
                        }}
                      >
                        {calcTotalServiceTime(s)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: "5px",
            }}
          >
            <View style={{ marginHorizontal: gap / 2 }}>
              <Text style={styles.text}>
                Total A (Évaluation et conseils) : {totalA}{" "}
                min.
                {totalA !== 0 && " (" + totalAHours + "h)"}
                {"\n"}
                Total B (Examens et traitements) : {
                  totalB
                }{" "}
                min.
                {totalB !== 0 && " (" + totalBHours + "h)"}
                {"\n"}
                Total C (Soins de base) : {totalC} min.
                {totalC !== 0 && " (" + totalCHours + "h)"}
              </Text>
            </View>
            <View style={{ marginHorizontal: gap / 2 }}>
              <Text style={styles.textBold}>
                Total : {totalA + totalB + totalC} min. (
                {Math.round(
                  ((totalA + totalB + totalC) * 100) / 60
                ) / 100}{" "}
                h)
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text
                style={{ fontSize: "8px", lineHeight: 1.4 }}
              >
                OPAS * : Prestation selon OPAS article 7
                alinéa 2
              </Text>
              <Text
                style={{ fontSize: "8px", lineHeight: 1.4 }}
              >
                Code * : Selon le catalogue des actes de
                l'ASSASD (novembre 2015)
              </Text>
            </View>
          </View>
        </Page>
      )}
    </Document>
  );
}
export default PdfOpas;