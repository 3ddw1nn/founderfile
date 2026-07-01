# California City Business License Source Audit

Last researched: 2026-07-01

This audit tracks the city business license URLs added to `packages/shared/src/california-cities.ts`.

## Perfect Matches

These rows have an official city landing page plus a distinct application URL and fee URL. Checklist URLs are included where the city publishes one or where the application page contains a clear registration checklist.

| City | County | Business license URL | Application URL | Fee URL | Checklist URL | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Fresno | Fresno | https://www.fresno.gov/finance/business-license-and-tax-certificate/ | https://businesstax.fresno.gov/Webblappformfresno/ | https://www.fresno.gov/wp-content/uploads/2024/07/MFS-Finance_580-ED-2024.07.01-1.pdf | https://www.fresno.gov/business-checklist/ | Fee source is the city master fee schedule PDF. |
| Long Beach | Los Angeles | https://www.longbeach.gov/finance/business-info/business-licenses/apply-for-a-business-license/ | https://www.longbeach.gov/finance/business-info/business-licenses/apply-for-a-business-license/ | https://www.longbeach.gov/finance/business-info/business-licenses/taxes--fees/ | https://www.longbeach.gov/finance/business-info/business-licenses/business-license-application-instructions/ | Official city pages split application, fees, and instructions. |
| Los Angeles | Los Angeles | https://business.lacity.gov/plan-business/register-your-business/business-tax-registration-certificate | https://latax.lacity.org/businessregapp/eappreg_criteria | https://finance.lacity.gov/tax-education/business-taxes/know-your-rates | https://finance.lacity.gov/tax-education/new-business-registration/how-register-btrc | Application portal is JavaScript-only but linked from the official city page. |
| Sacramento | Sacramento | https://www.cityofsacramento.gov/finance/revenue/business-operations-tax | https://www.cityofsacramento.gov/content/dam/portal/finance/Revenue/permits-and-taxes/BUSINESS-TAX-app_Revised-12-2019-FILLABLE.pdf | https://www.cityofsacramento.gov/finance/revenue/business-operations-tax |  | City uses a Business Operations Tax instead of issuing a business license. |
| San Diego | San Diego | https://www.sandiego.gov/treasurer/taxesfees/btax | https://pay.sandiego.gov/BTaxApp | https://www.sandiego.gov/treasurer/taxesfees/btax/btaxhow | https://www.sandiego.gov/treasurer/taxesfees/btax/btaxhow | Fee and registration requirements are on the application instructions page. |
| San Francisco | San Francisco | https://sftreasurer.org/business/register-business | https://etaxstatement.sfgov.org/accountupdate/newbusinessregistration/ | https://sftreasurer.org/business/register-business | https://sftreasurer.org/business/register-business | Fee schedule is embedded on the Treasurer registration page. |
| San Jose | Santa Clara | https://www.sanjoseca.gov/your-government/departments-offices/finance/business-tax-registration | https://businesstax.sanjoseca.gov/ | https://www.sanjoseca.gov/your-government/departments-offices/finance/business-tax-registration/business-tax-rates | https://www.sanjoseca.gov/your-government/departments-offices/finance/business-tax-registration/register-for-a-business-tax-certificate | Online portal is JavaScript-only but linked from the official city page. |

## Not Perfect Yet

These rows were updated only where the official city page was clear enough to improve the current stale data. They still need a second pass to find a distinct fee schedule, an exact online application endpoint, or a checklist.

| City | County | Business license URL | Application URL | Fee URL | Checklist URL | What is missing |
| --- | --- | --- | --- | --- | --- | --- |
| Anaheim | Orange | https://www.anaheim.net/1281/Business-License | https://www.anaheim.net/1281/Business-License | https://www.anaheim.net/1281/Business-License |  | Need distinct fee schedule/checklist if published separately. |
| Chula Vista | San Diego | https://www.chulavistaca.gov/departments/finance/business-license | https://www.chulavistaca.gov/departments/finance/business-license | https://www.chulavistaca.gov/departments/finance/business-license |  | Need distinct fee schedule/checklist if published separately. |
| Fremont | Alameda | https://www.fremont.gov/government/departments/business-tax | https://www.fremont.gov/government/departments/business-tax | https://www.fremont.gov/government/departments/business-tax |  | Need distinct fee schedule/checklist if published separately. |
| Oakland | Alameda | https://www.oaklandca.gov/Business/Business-Taxes-Licenses-Permits | https://www.oaklandca.gov/Business/Business-Taxes-Licenses-Permits | https://www.oaklandca.gov/Business/Business-Taxes-Licenses-Permits |  | Old service URL redirects here; need exact fee/rate page. |
| Riverside | Riverside | https://riversideca.gov/finance/business-tax | https://riversideca.gov/finance/business-tax | https://riversideca.gov/finance/business-tax |  | Need distinct fee schedule/checklist if published separately. |
| Santa Ana | Orange | https://www.santa-ana.org/finance-department/business-license/ | https://www.santa-ana.org/finance-department/business-license/ | https://www.santa-ana.org/finance-department/business-license/ |  | Need distinct fee schedule/checklist if published separately. |
| Stockton | San Joaquin | https://www.stocktonca.gov/government/departments/administrativeServices/businessLicense.html | https://www.stocktonca.gov/government/departments/administrativeServices/businessLicense.html | https://www.stocktonca.gov/government/departments/administrativeServices/businessLicense.html |  | Need distinct fee schedule/checklist if published separately. |

## JSON Batch

```json
[
  {
    "city": "Fresno",
    "county": "Fresno",
    "businessLicenseUrl": "https://www.fresno.gov/finance/business-license-and-tax-certificate/",
    "applicationUrl": "https://businesstax.fresno.gov/Webblappformfresno/",
    "feeUrl": "https://www.fresno.gov/wp-content/uploads/2024/07/MFS-Finance_580-ED-2024.07.01-1.pdf",
    "checklistUrl": "https://www.fresno.gov/business-checklist/",
    "status": "perfect"
  },
  {
    "city": "Long Beach",
    "county": "Los Angeles",
    "businessLicenseUrl": "https://www.longbeach.gov/finance/business-info/business-licenses/apply-for-a-business-license/",
    "applicationUrl": "https://www.longbeach.gov/finance/business-info/business-licenses/apply-for-a-business-license/",
    "feeUrl": "https://www.longbeach.gov/finance/business-info/business-licenses/taxes--fees/",
    "checklistUrl": "https://www.longbeach.gov/finance/business-info/business-licenses/business-license-application-instructions/",
    "status": "perfect"
  },
  {
    "city": "Los Angeles",
    "county": "Los Angeles",
    "businessLicenseUrl": "https://business.lacity.gov/plan-business/register-your-business/business-tax-registration-certificate",
    "applicationUrl": "https://latax.lacity.org/businessregapp/eappreg_criteria",
    "feeUrl": "https://finance.lacity.gov/tax-education/business-taxes/know-your-rates",
    "checklistUrl": "https://finance.lacity.gov/tax-education/new-business-registration/how-register-btrc",
    "status": "perfect"
  },
  {
    "city": "San Diego",
    "county": "San Diego",
    "businessLicenseUrl": "https://www.sandiego.gov/treasurer/taxesfees/btax",
    "applicationUrl": "https://pay.sandiego.gov/BTaxApp",
    "feeUrl": "https://www.sandiego.gov/treasurer/taxesfees/btax/btaxhow",
    "checklistUrl": "https://www.sandiego.gov/treasurer/taxesfees/btax/btaxhow",
    "status": "perfect"
  },
  {
    "city": "San Francisco",
    "county": "San Francisco",
    "businessLicenseUrl": "https://sftreasurer.org/business/register-business",
    "applicationUrl": "https://etaxstatement.sfgov.org/accountupdate/newbusinessregistration/",
    "feeUrl": "https://sftreasurer.org/business/register-business",
    "checklistUrl": "https://sftreasurer.org/business/register-business",
    "status": "perfect"
  },
  {
    "city": "San Jose",
    "county": "Santa Clara",
    "businessLicenseUrl": "https://www.sanjoseca.gov/your-government/departments-offices/finance/business-tax-registration",
    "applicationUrl": "https://businesstax.sanjoseca.gov/",
    "feeUrl": "https://www.sanjoseca.gov/your-government/departments-offices/finance/business-tax-registration/business-tax-rates",
    "checklistUrl": "https://www.sanjoseca.gov/your-government/departments-offices/finance/business-tax-registration/register-for-a-business-tax-certificate",
    "status": "perfect"
  }
]
```
