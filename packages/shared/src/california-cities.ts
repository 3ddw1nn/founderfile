export type CaCity = {
  name: string;
  county: string;
  portal?: {
    name: string;
    url: string;           // general info / landing page
    applicationUrl?: string; // actual online form or PDF application
    feeUrl?: string;         // page showing exact fee schedule
    checklistUrl?: string;   // requirements checklist (optional)
    fee: string;
    notes?: string;
    feeTable?: Array<{ label: string; newFee: string; renewal: string }>;
    feeFootnote?: string;
  };
};

export const CALIFORNIA_CITIES: CaCity[] = [
  // Alameda County
  { name: "Alameda", county: "Alameda", portal: { name: "City of Alameda Finance", url: "https://www.alamedaca.gov/Departments/Finance-Department/Business-License", fee: "$50–$200/yr", notes: "Annual renewal in January." } },
  { name: "Albany", county: "Alameda", portal: { name: "Albany Business License", url: "https://www.albanyca.org/departments/finance/business-license", fee: "~$70/yr" } },
  { name: "Berkeley", county: "Alameda", portal: { name: "Berkeley Finance Dept", url: "https://www.cityofberkeley.info/Finance/Business_License/", fee: "~$113 base + gross receipts" } },
  { name: "Dublin", county: "Alameda", portal: { name: "Dublin Finance", url: "https://www.dublin.ca.gov/148/Business-License", fee: "~$30–$150/yr" } },
  { name: "Emeryville", county: "Alameda", portal: { name: "Emeryville Finance", url: "https://www.emeryville.org/350/Business-License", fee: "~$75/yr" } },
  { name: "Fremont", county: "Alameda", portal: { name: "Fremont Business Tax", url: "https://www.fremont.gov/government/departments/business-tax", applicationUrl: "https://www.fremont.gov/government/departments/business-tax", feeUrl: "https://www.fremont.gov/government/departments/business-tax", fee: "~$75–$250/yr" } },
  { name: "Hayward", county: "Alameda", portal: { name: "Hayward Finance", url: "https://www.hayward-ca.gov/services/business/business-license", fee: "~$100/yr" } },
  { name: "Livermore", county: "Alameda", portal: { name: "Livermore Finance", url: "https://www.livermoreca.gov/services/business/business-license", fee: "~$50–$200/yr" } },
  { name: "Newark", county: "Alameda" },
  { name: "Oakland", county: "Alameda", portal: { name: "Oakland Business Tax", url: "https://www.oaklandca.gov/Business/Business-Taxes-Licenses-Permits", applicationUrl: "https://www.oaklandca.gov/Business/Business-Taxes-Licenses-Permits", feeUrl: "https://www.oaklandca.gov/Business/Business-Taxes-Licenses-Permits", fee: "~$90 min + gross receipts" } },
  { name: "Piedmont", county: "Alameda" },
  { name: "Pleasanton", county: "Alameda", portal: { name: "Pleasanton Finance", url: "https://www.cityofpleasantonca.gov/gov/depts/finance/business_license.asp", fee: "~$60–$200/yr" } },
  { name: "San Leandro", county: "Alameda", portal: { name: "San Leandro Finance", url: "https://www.sanleandro.org/depts/finance/bizlicense.asp", fee: "~$75/yr" } },
  { name: "Union City", county: "Alameda" },

  // Alpine County
  { name: "Markleeville", county: "Alpine" },

  // Amador County
  { name: "Amador City", county: "Amador" },
  { name: "Ione", county: "Amador" },
  { name: "Jackson", county: "Amador" },
  { name: "Plymouth", county: "Amador" },
  { name: "Sutter Creek", county: "Amador" },

  // Butte County
  { name: "Biggs", county: "Butte" },
  { name: "Chico", county: "Butte", portal: { name: "Chico Finance", url: "https://www.chico.ca.us/finance/business_license.shtml", fee: "~$50–$150/yr" } },
  { name: "Gridley", county: "Butte" },
  { name: "Oroville", county: "Butte" },
  { name: "Paradise", county: "Butte" },

  // Calaveras County
  { name: "Angels Camp", county: "Calaveras" },

  // Colusa County
  { name: "Colusa", county: "Colusa" },
  { name: "Williams", county: "Colusa" },

  // Contra Costa County
  { name: "Antioch", county: "Contra Costa", portal: { name: "Antioch Finance", url: "https://www.antiochca.gov/fc/finance/business-license/", fee: "~$50–$200/yr" } },
  { name: "Brentwood", county: "Contra Costa" },
  { name: "Clayton", county: "Contra Costa" },
  { name: "Concord", county: "Contra Costa", portal: { name: "Concord Finance", url: "https://www.cityofconcord.org/501/Business-License", fee: "~$75/yr" } },
  { name: "Danville", county: "Contra Costa" },
  { name: "El Cerrito", county: "Contra Costa" },
  { name: "Hercules", county: "Contra Costa" },
  { name: "Lafayette", county: "Contra Costa" },
  { name: "Martinez", county: "Contra Costa" },
  { name: "Moraga", county: "Contra Costa" },
  { name: "Oakley", county: "Contra Costa" },
  { name: "Orinda", county: "Contra Costa" },
  { name: "Pinole", county: "Contra Costa" },
  { name: "Pittsburg", county: "Contra Costa" },
  { name: "Pleasant Hill", county: "Contra Costa" },
  { name: "Richmond", county: "Contra Costa", portal: { name: "Richmond Finance", url: "https://www.ci.richmond.ca.us/1292/Business-License", fee: "~$75–$150/yr" } },
  { name: "San Pablo", county: "Contra Costa" },
  { name: "San Ramon", county: "Contra Costa" },
  { name: "Walnut Creek", county: "Contra Costa", portal: { name: "Walnut Creek Finance", url: "https://www.walnut-creek.org/departments/finance/business-license", fee: "~$60/yr" } },

  // Del Norte County
  { name: "Crescent City", county: "Del Norte" },

  // El Dorado County
  { name: "Placerville", county: "El Dorado" },
  { name: "South Lake Tahoe", county: "El Dorado", portal: { name: "South Lake Tahoe Finance", url: "https://www.cityofslt.us/188/Business-License", fee: "~$100/yr" } },

  // Fresno County
  { name: "Clovis", county: "Fresno", portal: { name: "Clovis Finance", url: "https://www.cityofclovis.com/departments/finance/business-license", fee: "~$35–$100/yr" } },
  { name: "Coalinga", county: "Fresno" },
  { name: "Firebaugh", county: "Fresno" },
  { name: "Fowler", county: "Fresno" },
  { name: "Fresno", county: "Fresno", portal: { name: "Fresno Finance", url: "https://www.fresno.gov/finance/business-license-and-tax-certificate/", applicationUrl: "https://businesstax.fresno.gov/Webblappformfresno/", feeUrl: "https://www.fresno.gov/wp-content/uploads/2024/07/MFS-Finance_580-ED-2024.07.01-1.pdf", checklistUrl: "https://www.fresno.gov/business-checklist/", fee: "~$25–$150/yr based on employees" } },
  { name: "Huron", county: "Fresno" },
  { name: "Kerman", county: "Fresno" },
  { name: "Kingsburg", county: "Fresno" },
  { name: "Mendota", county: "Fresno" },
  { name: "Orange Cove", county: "Fresno" },
  { name: "Parlier", county: "Fresno" },
  { name: "Reedley", county: "Fresno" },
  { name: "San Joaquin", county: "Fresno" },
  { name: "Sanger", county: "Fresno" },
  { name: "Selma", county: "Fresno" },

  // Glenn County
  { name: "Orland", county: "Glenn" },
  { name: "Willows", county: "Glenn" },

  // Humboldt County
  { name: "Arcata", county: "Humboldt" },
  { name: "Blue Lake", county: "Humboldt" },
  { name: "Eureka", county: "Humboldt" },
  { name: "Ferndale", county: "Humboldt" },
  { name: "Fortuna", county: "Humboldt" },
  { name: "Rio Dell", county: "Humboldt" },
  { name: "Trinidad", county: "Humboldt" },

  // Imperial County
  { name: "Brawley", county: "Imperial" },
  { name: "Calexico", county: "Imperial" },
  { name: "Calipatria", county: "Imperial" },
  { name: "El Centro", county: "Imperial" },
  { name: "Holtville", county: "Imperial" },
  { name: "Imperial", county: "Imperial" },
  { name: "Westmorland", county: "Imperial" },

  // Inyo County
  { name: "Bishop", county: "Inyo" },

  // Kern County
  { name: "Arvin", county: "Kern" },
  { name: "Bakersfield", county: "Kern", portal: { name: "Bakersfield Finance", url: "https://www.bakersfieldcity.us/gov/depts/finance/business_license.htm", fee: "~$30–$200/yr" } },
  { name: "California City", county: "Kern" },
  { name: "Delano", county: "Kern" },
  { name: "Maricopa", county: "Kern" },
  { name: "McFarland", county: "Kern" },
  { name: "Ridgecrest", county: "Kern" },
  { name: "Shafter", county: "Kern" },
  { name: "Taft", county: "Kern" },
  { name: "Tehachapi", county: "Kern" },
  { name: "Wasco", county: "Kern" },

  // Kings County
  { name: "Avenal", county: "Kings" },
  { name: "Corcoran", county: "Kings" },
  { name: "Hanford", county: "Kings" },
  { name: "Lemoore", county: "Kings" },

  // Lake County
  { name: "Clearlake", county: "Lake" },
  { name: "Lakeport", county: "Lake" },

  // Lassen County
  { name: "Susanville", county: "Lassen" },

  // Los Angeles County
  { name: "Alhambra", county: "Los Angeles" },
  { name: "Arcadia", county: "Los Angeles" },
  { name: "Artesia", county: "Los Angeles" },
  { name: "Avalon", county: "Los Angeles" },
  { name: "Azusa", county: "Los Angeles" },
  { name: "Baldwin Park", county: "Los Angeles" },
  { name: "Bell", county: "Los Angeles" },
  { name: "Bell Gardens", county: "Los Angeles" },
  { name: "Bellflower", county: "Los Angeles" },
  { name: "Beverly Hills", county: "Los Angeles", portal: { name: "Beverly Hills Finance", url: "https://www.beverlyhills.org/departments/finance/businesslicense/", fee: "~$93–$500/yr" } },
  { name: "Bradbury", county: "Los Angeles" },
  { name: "Burbank", county: "Los Angeles", portal: { name: "Burbank Finance", url: "https://www.burbankca.gov/departments/finance/business-license", fee: "~$88/yr" } },
  { name: "Calabasas", county: "Los Angeles" },
  { name: "Carson", county: "Los Angeles" },
  { name: "Cerritos", county: "Los Angeles" },
  { name: "Claremont", county: "Los Angeles" },
  { name: "Commerce", county: "Los Angeles" },
  { name: "Compton", county: "Los Angeles" },
  { name: "Covina", county: "Los Angeles" },
  { name: "Cudahy", county: "Los Angeles" },
  { name: "Culver City", county: "Los Angeles", portal: { name: "Culver City Finance", url: "https://www.culvercity.org/City-Government/City-Departments/Finance/Business-Tax-License", fee: "~$50–$500/yr" } },
  { name: "Diamond Bar", county: "Los Angeles" },
  { name: "Downey", county: "Los Angeles" },
  { name: "Duarte", county: "Los Angeles" },
  { name: "El Monte", county: "Los Angeles" },
  { name: "El Segundo", county: "Los Angeles" },
  { name: "Gardena", county: "Los Angeles" },
  { name: "Glendale", county: "Los Angeles", portal: { name: "Glendale Finance", url: "https://www.glendaleca.gov/government/departments/finance/business-license", fee: "~$50–$300/yr" } },
  { name: "Glendora", county: "Los Angeles" },
  { name: "Hawaiian Gardens", county: "Los Angeles" },
  { name: "Hawthorne", county: "Los Angeles" },
  { name: "Hermosa Beach", county: "Los Angeles" },
  { name: "Hidden Hills", county: "Los Angeles" },
  { name: "Huntington Park", county: "Los Angeles" },
  { name: "Industry", county: "Los Angeles" },
  { name: "Inglewood", county: "Los Angeles" },
  { name: "Irwindale", county: "Los Angeles" },
  { name: "La Cañada Flintridge", county: "Los Angeles" },
  { name: "La Habra Heights", county: "Los Angeles" },
  { name: "La Mirada", county: "Los Angeles" },
  { name: "La Puente", county: "Los Angeles" },
  { name: "La Verne", county: "Los Angeles" },
  { name: "Lakewood", county: "Los Angeles" },
  { name: "Lancaster", county: "Los Angeles" },
  { name: "Lawndale", county: "Los Angeles" },
  { name: "Lomita", county: "Los Angeles" },
  { name: "Long Beach", county: "Los Angeles", portal: { name: "Long Beach Finance", url: "https://www.longbeach.gov/finance/business-info/business-licenses/apply-for-a-business-license/", applicationUrl: "https://www.longbeach.gov/finance/business-info/business-licenses/apply-for-a-business-license/", feeUrl: "https://www.longbeach.gov/finance/business-info/business-licenses/taxes--fees/", checklistUrl: "https://www.longbeach.gov/finance/business-info/business-licenses/business-license-application-instructions/", fee: "~$33–$300/yr" } },
  { name: "Los Angeles", county: "Los Angeles", portal: { name: "LA Office of Finance", url: "https://business.lacity.gov/plan-business/register-your-business/business-tax-registration-certificate", applicationUrl: "https://latax.lacity.org/businessregapp/eappreg_criteria", feeUrl: "https://finance.lacity.gov/tax-education/business-taxes/know-your-rates", checklistUrl: "https://finance.lacity.gov/tax-education/new-business-registration/how-register-btrc", fee: "~$1.32 per $1,000 gross receipts, min $153" } },
  { name: "Lynwood", county: "Los Angeles" },
  { name: "Malibu", county: "Los Angeles" },
  { name: "Manhattan Beach", county: "Los Angeles" },
  { name: "Maywood", county: "Los Angeles" },
  { name: "Monrovia", county: "Los Angeles" },
  { name: "Montebello", county: "Los Angeles" },
  { name: "Monterey Park", county: "Los Angeles" },
  { name: "Norwalk", county: "Los Angeles" },
  { name: "Palmdale", county: "Los Angeles" },
  { name: "Palos Verdes Estates", county: "Los Angeles" },
  { name: "Paramount", county: "Los Angeles" },
  { name: "Pasadena", county: "Los Angeles", portal: { name: "Pasadena Finance", url: "https://www.cityofpasadena.net/finance/business-license/", fee: "~$75–$300/yr" } },
  { name: "Pico Rivera", county: "Los Angeles" },
  { name: "Pomona", county: "Los Angeles" },
  { name: "Rancho Palos Verdes", county: "Los Angeles" },
  { name: "Redondo Beach", county: "Los Angeles" },
  { name: "Rolling Hills", county: "Los Angeles" },
  { name: "Rolling Hills Estates", county: "Los Angeles" },
  { name: "Rosemead", county: "Los Angeles" },
  { name: "San Dimas", county: "Los Angeles" },
  { name: "San Fernando", county: "Los Angeles" },
  { name: "San Gabriel", county: "Los Angeles" },
  { name: "San Marino", county: "Los Angeles" },
  { name: "Santa Clarita", county: "Los Angeles", portal: { name: "Santa Clarita Finance", url: "https://www.santa-clarita.com/city-hall/finance/business-license", fee: "~$46/yr flat" } },
  { name: "Santa Fe Springs", county: "Los Angeles" },
  { name: "Santa Monica", county: "Los Angeles", portal: { name: "Santa Monica Finance", url: "https://www.santamonica.gov/permits/business-license-tax", fee: "~$75 base + gross receipts tax" } },
  { name: "Sierra Madre", county: "Los Angeles" },
  { name: "Signal Hill", county: "Los Angeles" },
  { name: "South El Monte", county: "Los Angeles" },
  { name: "South Gate", county: "Los Angeles" },
  { name: "South Pasadena", county: "Los Angeles" },
  { name: "Temple City", county: "Los Angeles" },
  { name: "Torrance", county: "Los Angeles", portal: { name: "Torrance Finance", url: "https://www.torrance.ca.us/finance/business-license", fee: "~$66/yr base" } },
  { name: "Vernon", county: "Los Angeles" },
  { name: "Walnut", county: "Los Angeles" },
  { name: "West Covina", county: "Los Angeles" },
  { name: "West Hollywood", county: "Los Angeles", portal: { name: "West Hollywood Finance", url: "https://www.weho.org/city-hall/city-departments/finance/business-license", fee: "~$75–$500/yr" } },
  { name: "Westlake Village", county: "Los Angeles" },
  { name: "Whittier", county: "Los Angeles" },

  // Madera County
  { name: "Chowchilla", county: "Madera" },
  { name: "Madera", county: "Madera" },

  // Marin County
  { name: "Belvedere", county: "Marin" },
  { name: "Corte Madera", county: "Marin" },
  { name: "Fairfax", county: "Marin" },
  { name: "Larkspur", county: "Marin" },
  { name: "Mill Valley", county: "Marin" },
  { name: "Novato", county: "Marin" },
  { name: "Ross", county: "Marin" },
  { name: "San Anselmo", county: "Marin" },
  { name: "San Rafael", county: "Marin", portal: { name: "San Rafael Finance", url: "https://www.cityofsanrafael.org/finance-business-license/", fee: "~$55–$200/yr" } },
  { name: "Sausalito", county: "Marin" },
  { name: "Tiburon", county: "Marin" },

  // Mariposa County
  // (no incorporated cities)

  // Mendocino County
  { name: "Fort Bragg", county: "Mendocino" },
  { name: "Point Arena", county: "Mendocino" },
  { name: "Ukiah", county: "Mendocino" },
  { name: "Willits", county: "Mendocino" },

  // Merced County
  { name: "Atwater", county: "Merced" },
  { name: "Dos Palos", county: "Merced" },
  { name: "Gustine", county: "Merced" },
  { name: "Livingston", county: "Merced" },
  { name: "Los Banos", county: "Merced" },
  { name: "Merced", county: "Merced" },

  // Modoc County
  { name: "Alturas", county: "Modoc" },

  // Mono County
  { name: "Mammoth Lakes", county: "Mono" },

  // Monterey County
  { name: "Carmel-by-the-Sea", county: "Monterey" },
  { name: "Del Rey Oaks", county: "Monterey" },
  { name: "Gonzales", county: "Monterey" },
  { name: "Greenfield", county: "Monterey" },
  { name: "King City", county: "Monterey" },
  { name: "Marina", county: "Monterey" },
  { name: "Monterey", county: "Monterey", portal: { name: "Monterey Finance", url: "https://www.monterey.org/Departments/Finance/Business-License", fee: "~$60–$200/yr" } },
  { name: "Pacific Grove", county: "Monterey" },
  { name: "Salinas", county: "Monterey", portal: { name: "Salinas Finance", url: "https://www.ci.salinas.ca.us/services/finance/business_license.cfm", fee: "~$50–$150/yr" } },
  { name: "Sand City", county: "Monterey" },
  { name: "Seaside", county: "Monterey" },
  { name: "Soledad", county: "Monterey" },

  // Napa County
  { name: "American Canyon", county: "Napa" },
  { name: "Calistoga", county: "Napa" },
  { name: "Napa", county: "Napa", portal: { name: "Napa Finance", url: "https://www.cityofnapa.org/232/Business-License", fee: "~$45–$200/yr" } },
  { name: "St. Helena", county: "Napa" },
  { name: "Yountville", county: "Napa" },

  // Nevada County
  { name: "Grass Valley", county: "Nevada" },
  { name: "Nevada City", county: "Nevada" },
  { name: "Truckee", county: "Nevada" },

  // Orange County
  { name: "Aliso Viejo", county: "Orange" },
  { name: "Anaheim", county: "Orange", portal: { name: "Anaheim Finance", url: "https://www.anaheim.net/1281/Business-License", applicationUrl: "https://www.anaheim.net/1281/Business-License", feeUrl: "https://www.anaheim.net/1281/Business-License", fee: "~$49/yr flat" } },
  { name: "Brea", county: "Orange" },
  { name: "Buena Park", county: "Orange" },
  { name: "Costa Mesa", county: "Orange", portal: { name: "Costa Mesa Finance", url: "https://www.costamesaca.gov/government/departments/finance/business-licenses", fee: "~$58–$250/yr" } },
  { name: "Cypress", county: "Orange" },
  { name: "Dana Point", county: "Orange" },
  { name: "Fountain Valley", county: "Orange" },
  { name: "Fullerton", county: "Orange" },
  { name: "Garden Grove", county: "Orange" },
  { name: "Huntington Beach", county: "Orange", portal: { name: "Huntington Beach Finance", url: "https://www.huntingtonbeachca.gov/government/departments/finance/business-license/", fee: "~$81/yr" } },
  { name: "Irvine", county: "Orange", portal: { name: "Irvine Finance Department", url: "https://secure.cityofirvine.org/businesslicenseapplication/", fee: "$76–$152 (new)", notes: "Apply within 60 days of start date. Have your business address, start date, activity description, business category, and owner info ready.", feeTable: [{ label: "< 10 employees", newFee: "$76", renewal: "$76" }, { label: "10+ employees", newFee: "$152", renewal: "$102" }], feeFootnote: "Includes $4 CA ADA fee. Late filing: $111+. Renewal penalty: $70.45 after 60 days past expiration." } },
  { name: "La Habra", county: "Orange" },
  { name: "La Palma", county: "Orange" },
  { name: "Laguna Beach", county: "Orange" },
  { name: "Laguna Hills", county: "Orange" },
  { name: "Laguna Niguel", county: "Orange" },
  { name: "Laguna Woods", county: "Orange" },
  { name: "Lake Forest", county: "Orange" },
  { name: "Los Alamitos", county: "Orange" },
  { name: "Mission Viejo", county: "Orange" },
  { name: "Newport Beach", county: "Orange", portal: { name: "Newport Beach Finance", url: "https://www.newportbeachca.gov/government/departments/finance/business-license", fee: "~$90/yr" } },
  { name: "Orange", county: "Orange" },
  { name: "Placentia", county: "Orange" },
  { name: "Rancho Santa Margarita", county: "Orange" },
  { name: "San Clemente", county: "Orange" },
  { name: "San Juan Capistrano", county: "Orange" },
  { name: "Santa Ana", county: "Orange", portal: { name: "Santa Ana Finance", url: "https://www.santa-ana.org/finance-department/business-license/", applicationUrl: "https://www.santa-ana.org/finance-department/business-license/", feeUrl: "https://www.santa-ana.org/finance-department/business-license/", fee: "~$95/yr" } },
  { name: "Seal Beach", county: "Orange" },
  { name: "Stanton", county: "Orange" },
  { name: "Tustin", county: "Orange" },
  { name: "Villa Park", county: "Orange" },
  { name: "Westminster", county: "Orange" },
  { name: "Yorba Linda", county: "Orange" },

  // Placer County
  { name: "Auburn", county: "Placer" },
  { name: "Colfax", county: "Placer" },
  { name: "Lincoln", county: "Placer" },
  { name: "Loomis", county: "Placer" },
  { name: "Rocklin", county: "Placer" },
  { name: "Roseville", county: "Placer", portal: { name: "Roseville Finance", url: "https://www.roseville.ca.us/businesses/business_licensing", fee: "~$49/yr" } },

  // Plumas County
  { name: "Portola", county: "Plumas" },

  // Riverside County
  { name: "Banning", county: "Riverside" },
  { name: "Beaumont", county: "Riverside" },
  { name: "Blythe", county: "Riverside" },
  { name: "Calimesa", county: "Riverside" },
  { name: "Canyon Lake", county: "Riverside" },
  { name: "Cathedral City", county: "Riverside" },
  { name: "Coachella", county: "Riverside" },
  { name: "Corona", county: "Riverside", portal: { name: "Corona Finance", url: "https://www.coronaca.gov/government/departments-divisions/finance/business-license", fee: "~$60–$200/yr" } },
  { name: "Desert Hot Springs", county: "Riverside" },
  { name: "Eastvale", county: "Riverside" },
  { name: "Hemet", county: "Riverside" },
  { name: "Indian Wells", county: "Riverside" },
  { name: "Indio", county: "Riverside" },
  { name: "Jurupa Valley", county: "Riverside" },
  { name: "La Quinta", county: "Riverside" },
  { name: "Lake Elsinore", county: "Riverside" },
  { name: "Menifee", county: "Riverside" },
  { name: "Moreno Valley", county: "Riverside", portal: { name: "Moreno Valley Finance", url: "https://www.morenovalleyca.gov/government/departments/finance/business-license", fee: "~$64/yr" } },
  { name: "Murrieta", county: "Riverside" },
  { name: "Norco", county: "Riverside" },
  { name: "Palm Desert", county: "Riverside" },
  { name: "Palm Springs", county: "Riverside", portal: { name: "Palm Springs Finance", url: "https://www.palmspringsca.gov/government/departments/finance/business-license", fee: "~$100–$300/yr" } },
  { name: "Perris", county: "Riverside" },
  { name: "Rancho Mirage", county: "Riverside" },
  { name: "Riverside", county: "Riverside", portal: { name: "Riverside Finance", url: "https://riversideca.gov/finance/business-tax", applicationUrl: "https://riversideca.gov/finance/business-tax", feeUrl: "https://riversideca.gov/finance/business-tax", fee: "~$80–$200/yr" } },
  { name: "San Jacinto", county: "Riverside" },
  { name: "Temecula", county: "Riverside", portal: { name: "Temecula Finance", url: "https://temeculaca.gov/215/Business-License", fee: "~$60/yr" } },
  { name: "Wildomar", county: "Riverside" },

  // Sacramento County
  { name: "Citrus Heights", county: "Sacramento" },
  { name: "Elk Grove", county: "Sacramento", portal: { name: "Elk Grove Finance", url: "https://www.elkgrovecity.org/city_hall/departments/finance/business_license", fee: "~$60/yr" } },
  { name: "Folsom", county: "Sacramento", portal: { name: "Folsom Finance", url: "https://www.folsom.ca.us/departments/finance/business-license", fee: "~$62/yr" } },
  { name: "Galt", county: "Sacramento" },
  { name: "Isleton", county: "Sacramento" },
  { name: "Rancho Cordova", county: "Sacramento" },
  { name: "Sacramento", county: "Sacramento", portal: { name: "Sacramento Finance", url: "https://www.cityofsacramento.gov/finance/revenue/business-operations-tax", applicationUrl: "https://www.cityofsacramento.gov/content/dam/portal/finance/Revenue/permits-and-taxes/BUSINESS-TAX-app_Revised-12-2019-FILLABLE.pdf", feeUrl: "https://www.cityofsacramento.gov/finance/revenue/business-operations-tax", fee: "~$64/yr base + flat rates by type" } },

  // San Benito County
  { name: "Hollister", county: "San Benito" },
  { name: "San Juan Bautista", county: "San Benito" },

  // San Bernardino County
  { name: "Adelanto", county: "San Bernardino" },
  { name: "Apple Valley", county: "San Bernardino" },
  { name: "Barstow", county: "San Bernardino" },
  { name: "Big Bear Lake", county: "San Bernardino" },
  { name: "Chino", county: "San Bernardino" },
  { name: "Chino Hills", county: "San Bernardino" },
  { name: "Colton", county: "San Bernardino" },
  { name: "Fontana", county: "San Bernardino", portal: { name: "Fontana Finance", url: "https://www.fontanaca.gov/finance/business-license", fee: "~$50–$200/yr" } },
  { name: "Grand Terrace", county: "San Bernardino" },
  { name: "Hesperia", county: "San Bernardino" },
  { name: "Highland", county: "San Bernardino" },
  { name: "Loma Linda", county: "San Bernardino" },
  { name: "Montclair", county: "San Bernardino" },
  { name: "Needles", county: "San Bernardino" },
  { name: "Ontario", county: "San Bernardino", portal: { name: "Ontario Finance", url: "https://www.ontarioca.gov/Finance/BusinessLicense", fee: "~$50–$200/yr" } },
  { name: "Rancho Cucamonga", county: "San Bernardino", portal: { name: "Rancho Cucamonga Finance", url: "https://www.cityofrc.us/cityhall/finance/bizlicense.asp", fee: "~$77/yr" } },
  { name: "Redlands", county: "San Bernardino" },
  { name: "Rialto", county: "San Bernardino" },
  { name: "San Bernardino", county: "San Bernardino", portal: { name: "San Bernardino Finance", url: "https://www.ci.san-bernardino.ca.us/departments/finance/business_registration/", fee: "~$60–$200/yr" } },
  { name: "Twentynine Palms", county: "San Bernardino" },
  { name: "Upland", county: "San Bernardino" },
  { name: "Victorville", county: "San Bernardino" },
  { name: "Yucaipa", county: "San Bernardino" },
  { name: "Yucca Valley", county: "San Bernardino" },

  // San Diego County
  { name: "Carlsbad", county: "San Diego", portal: { name: "Carlsbad Finance", url: "https://www.carlsbadca.gov/departments/finance/business-license", fee: "~$57/yr" } },
  { name: "Chula Vista", county: "San Diego", portal: { name: "Chula Vista Finance", url: "https://www.chulavistaca.gov/departments/finance/business-license", applicationUrl: "https://www.chulavistaca.gov/departments/finance/business-license", feeUrl: "https://www.chulavistaca.gov/departments/finance/business-license", fee: "~$45–$200/yr" } },
  { name: "Coronado", county: "San Diego" },
  { name: "Del Mar", county: "San Diego" },
  { name: "El Cajon", county: "San Diego" },
  { name: "Encinitas", county: "San Diego" },
  { name: "Escondido", county: "San Diego" },
  { name: "Imperial Beach", county: "San Diego" },
  { name: "La Mesa", county: "San Diego" },
  { name: "Lemon Grove", county: "San Diego" },
  { name: "National City", county: "San Diego" },
  { name: "Oceanside", county: "San Diego", portal: { name: "Oceanside Finance", url: "https://www.oceansideca.org/government/departments/finance/business-license", fee: "~$55/yr" } },
  { name: "Poway", county: "San Diego" },
  { name: "San Diego", county: "San Diego", portal: { name: "San Diego Treasurer", url: "https://www.sandiego.gov/treasurer/taxesfees/btax", applicationUrl: "https://pay.sandiego.gov/BTaxApp", feeUrl: "https://www.sandiego.gov/treasurer/taxesfees/btax/btaxhow", checklistUrl: "https://www.sandiego.gov/treasurer/taxesfees/btax/btaxhow", fee: "~$34–$125/yr based on employees" } },
  { name: "San Marcos", county: "San Diego" },
  { name: "Santee", county: "San Diego" },
  { name: "Solana Beach", county: "San Diego" },
  { name: "Vista", county: "San Diego" },

  // San Francisco County
  { name: "San Francisco", county: "San Francisco", portal: { name: "SF Office of the Treasurer", url: "https://sftreasurer.org/business/register-business", applicationUrl: "https://etaxstatement.sfgov.org/accountupdate/newbusinessregistration/", feeUrl: "https://sftreasurer.org/business/register-business", checklistUrl: "https://sftreasurer.org/business/register-business", fee: "$55+ registration based on gross receipts", notes: "All businesses must register. Gross receipts tax applies based on industry and revenue." } },

  // San Joaquin County
  { name: "Escalon", county: "San Joaquin" },
  { name: "Lathrop", county: "San Joaquin" },
  { name: "Lodi", county: "San Joaquin" },
  { name: "Manteca", county: "San Joaquin" },
  { name: "Ripon", county: "San Joaquin" },
  { name: "Stockton", county: "San Joaquin", portal: { name: "Stockton Finance", url: "https://www.stocktonca.gov/government/departments/administrativeServices/businessLicense.html", applicationUrl: "https://www.stocktonca.gov/government/departments/administrativeServices/businessLicense.html", feeUrl: "https://www.stocktonca.gov/government/departments/administrativeServices/businessLicense.html", fee: "~$50–$200/yr" } },
  { name: "Tracy", county: "San Joaquin" },

  // San Luis Obispo County
  { name: "Arroyo Grande", county: "San Luis Obispo" },
  { name: "Atascadero", county: "San Luis Obispo" },
  { name: "Grover Beach", county: "San Luis Obispo" },
  { name: "Morro Bay", county: "San Luis Obispo" },
  { name: "Paso Robles", county: "San Luis Obispo" },
  { name: "Pismo Beach", county: "San Luis Obispo" },
  { name: "San Luis Obispo", county: "San Luis Obispo", portal: { name: "SLO Finance", url: "https://www.slocity.org/government/department-directory/finance/business-tax", fee: "~$30–$200/yr" } },

  // San Mateo County
  { name: "Atherton", county: "San Mateo" },
  { name: "Belmont", county: "San Mateo" },
  { name: "Brisbane", county: "San Mateo" },
  { name: "Burlingame", county: "San Mateo" },
  { name: "Colma", county: "San Mateo" },
  { name: "Daly City", county: "San Mateo" },
  { name: "East Palo Alto", county: "San Mateo" },
  { name: "Foster City", county: "San Mateo" },
  { name: "Half Moon Bay", county: "San Mateo" },
  { name: "Hillsborough", county: "San Mateo" },
  { name: "Menlo Park", county: "San Mateo" },
  { name: "Millbrae", county: "San Mateo" },
  { name: "Pacifica", county: "San Mateo" },
  { name: "Portola Valley", county: "San Mateo" },
  { name: "Redwood City", county: "San Mateo", portal: { name: "Redwood City Finance", url: "https://www.redwoodcity.org/departments/finance/business-license", fee: "~$75/yr" } },
  { name: "San Bruno", county: "San Mateo" },
  { name: "San Carlos", county: "San Mateo" },
  { name: "San Mateo", county: "San Mateo", portal: { name: "San Mateo Finance", url: "https://www.cityofsanmateo.org/284/Business-License", fee: "~$100/yr" } },
  { name: "South San Francisco", county: "San Mateo" },
  { name: "Woodside", county: "San Mateo" },

  // Santa Barbara County
  { name: "Buellton", county: "Santa Barbara" },
  { name: "Carpinteria", county: "Santa Barbara" },
  { name: "Goleta", county: "Santa Barbara" },
  { name: "Guadalupe", county: "Santa Barbara" },
  { name: "Lompoc", county: "Santa Barbara" },
  { name: "Santa Barbara", county: "Santa Barbara", portal: { name: "Santa Barbara Finance", url: "https://www.santabarbaraca.gov/finance/business-license/", fee: "~$36–$200/yr" } },
  { name: "Santa Maria", county: "Santa Barbara" },
  { name: "Solvang", county: "Santa Barbara" },

  // Santa Clara County
  { name: "Campbell", county: "Santa Clara" },
  { name: "Cupertino", county: "Santa Clara", portal: { name: "Cupertino Finance", url: "https://www.cupertino.org/our-city/departments/finance/business-license", fee: "~$30–$100/yr" } },
  { name: "Gilroy", county: "Santa Clara" },
  { name: "Los Altos", county: "Santa Clara" },
  { name: "Los Altos Hills", county: "Santa Clara" },
  { name: "Los Gatos", county: "Santa Clara" },
  { name: "Milpitas", county: "Santa Clara" },
  { name: "Monte Sereno", county: "Santa Clara" },
  { name: "Morgan Hill", county: "Santa Clara" },
  { name: "Mountain View", county: "Santa Clara", portal: { name: "Mountain View Finance", url: "https://www.mountainview.gov/depts/fin/business_license/default.asp", fee: "No fee (eliminated)", notes: "Mountain View eliminated the business license fee. Registration is still required." } },
  { name: "Palo Alto", county: "Santa Clara", portal: { name: "Palo Alto Finance", url: "https://www.cityofpaloalto.org/Departments/Finance/Business-License", fee: "~$45–$200/yr" } },
  { name: "San Jose", county: "Santa Clara", portal: { name: "San Jose Finance", url: "https://www.sanjoseca.gov/your-government/departments-offices/finance/business-tax-registration", applicationUrl: "https://businesstax.sanjoseca.gov/", feeUrl: "https://www.sanjoseca.gov/your-government/departments-offices/finance/business-tax-registration/business-tax-rates", checklistUrl: "https://www.sanjoseca.gov/your-government/departments-offices/finance/business-tax-registration/register-for-a-business-tax-certificate", fee: "~$195/yr base + employees" } },
  { name: "Santa Clara", county: "Santa Clara", portal: { name: "Santa Clara Finance", url: "https://www.santaclaraca.gov/government/departments/finance/business-license", fee: "~$45/yr" } },
  { name: "Saratoga", county: "Santa Clara" },
  { name: "Sunnyvale", county: "Santa Clara", portal: { name: "Sunnyvale Finance", url: "https://sunnyvale.ca.gov/your-government/departments/finance/business-license", fee: "~$95–$250/yr" } },

  // Santa Cruz County
  { name: "Capitola", county: "Santa Cruz" },
  { name: "Santa Cruz", county: "Santa Cruz", portal: { name: "Santa Cruz Finance", url: "https://www.cityofsantacruz.com/government/city-departments/finance/business-license", fee: "~$62/yr" } },
  { name: "Scotts Valley", county: "Santa Cruz" },
  { name: "Watsonville", county: "Santa Cruz" },

  // Shasta County
  { name: "Anderson", county: "Shasta" },
  { name: "Redding", county: "Shasta", portal: { name: "Redding Finance", url: "https://www.cityofredding.org/departments/finance/business-license", fee: "~$40–$150/yr" } },
  { name: "Shasta Lake", county: "Shasta" },

  // Sierra County
  { name: "Loyalton", county: "Sierra" },

  // Siskiyou County
  { name: "Dorris", county: "Siskiyou" },
  { name: "Dunsmuir", county: "Siskiyou" },
  { name: "Etna", county: "Siskiyou" },
  { name: "Fort Jones", county: "Siskiyou" },
  { name: "Montague", county: "Siskiyou" },
  { name: "Mount Shasta", county: "Siskiyou" },
  { name: "Tulelake", county: "Siskiyou" },
  { name: "Weed", county: "Siskiyou" },
  { name: "Yreka", county: "Siskiyou" },

  // Solano County
  { name: "Benicia", county: "Solano" },
  { name: "Dixon", county: "Solano" },
  { name: "Fairfield", county: "Solano", portal: { name: "Fairfield Finance", url: "https://www.fairfield.ca.gov/gov/depts/finance/business_license/default.asp", fee: "~$40–$150/yr" } },
  { name: "Rio Vista", county: "Solano" },
  { name: "Suisun City", county: "Solano" },
  { name: "Vacaville", county: "Solano" },
  { name: "Vallejo", county: "Solano" },

  // Sonoma County
  { name: "Cloverdale", county: "Sonoma" },
  { name: "Cotati", county: "Sonoma" },
  { name: "Healdsburg", county: "Sonoma" },
  { name: "Petaluma", county: "Sonoma" },
  { name: "Rohnert Park", county: "Sonoma" },
  { name: "Santa Rosa", county: "Sonoma", portal: { name: "Santa Rosa Finance", url: "https://srcity.org/1064/Business-License", fee: "~$93–$300/yr" } },
  { name: "Sebastopol", county: "Sonoma" },
  { name: "Sonoma", county: "Sonoma" },
  { name: "Windsor", county: "Sonoma" },

  // Stanislaus County
  { name: "Ceres", county: "Stanislaus" },
  { name: "Hughson", county: "Stanislaus" },
  { name: "Modesto", county: "Stanislaus", portal: { name: "Modesto Finance", url: "https://www.modestogov.com/219/Business-License", fee: "~$45–$200/yr" } },
  { name: "Newman", county: "Stanislaus" },
  { name: "Oakdale", county: "Stanislaus" },
  { name: "Patterson", county: "Stanislaus" },
  { name: "Riverbank", county: "Stanislaus" },
  { name: "Turlock", county: "Stanislaus" },
  { name: "Waterford", county: "Stanislaus" },

  // Sutter County
  { name: "Live Oak", county: "Sutter" },
  { name: "Yuba City", county: "Sutter" },

  // Tehama County
  { name: "Corning", county: "Tehama" },
  { name: "Red Bluff", county: "Tehama" },
  { name: "Tehama", county: "Tehama" },

  // Trinity County
  // (no incorporated cities)

  // Tulare County
  { name: "Dinuba", county: "Tulare" },
  { name: "Exeter", county: "Tulare" },
  { name: "Farmersville", county: "Tulare" },
  { name: "Lindsay", county: "Tulare" },
  { name: "Porterville", county: "Tulare" },
  { name: "Tulare", county: "Tulare" },
  { name: "Visalia", county: "Tulare", portal: { name: "Visalia Finance", url: "https://www.visalia.city/537/Business-License", fee: "~$60–$200/yr" } },
  { name: "Woodlake", county: "Tulare" },

  // Tuolumne County
  { name: "Sonora", county: "Tuolumne" },

  // Ventura County
  { name: "Camarillo", county: "Ventura" },
  { name: "Fillmore", county: "Ventura" },
  { name: "Moorpark", county: "Ventura" },
  { name: "Ojai", county: "Ventura" },
  { name: "Oxnard", county: "Ventura", portal: { name: "Oxnard Finance", url: "https://www.oxnard.org/finance/business-license/", fee: "~$50–$200/yr" } },
  { name: "Port Hueneme", county: "Ventura" },
  { name: "Santa Paula", county: "Ventura" },
  { name: "Simi Valley", county: "Ventura", portal: { name: "Simi Valley Finance", url: "https://www.simivalley.org/departments/finance/business-license", fee: "~$60/yr" } },
  { name: "Thousand Oaks", county: "Ventura", portal: { name: "Thousand Oaks Finance", url: "https://www.toaks.org/departments/finance/business-licensing", fee: "~$60–$250/yr" } },
  { name: "Ventura", county: "Ventura", portal: { name: "Ventura Finance", url: "https://www.cityofventura.ca.gov/161/Business-License", fee: "~$40–$200/yr" } },

  // Yolo County
  { name: "Davis", county: "Yolo", portal: { name: "Davis Finance", url: "https://www.cityofdavis.org/city-hall/finance-and-information-technology/business-license", fee: "~$55/yr" } },
  { name: "West Sacramento", county: "Yolo" },
  { name: "Winters", county: "Yolo" },
  { name: "Woodland", county: "Yolo" },

  // Yuba County
  { name: "Marysville", county: "Yuba" },
  { name: "Wheatland", county: "Yuba" },
];

export function searchCities(query: string): CaCity[] {
  const q = query.toLowerCase().trim();
  if (!q) return CALIFORNIA_CITIES;
  return CALIFORNIA_CITIES.filter(
    (city) => city.name.toLowerCase().includes(q) || city.county.toLowerCase().includes(q)
  );
}

export function getCityByName(name: string): CaCity | undefined {
  return CALIFORNIA_CITIES.find((city) => city.name === name);
}
