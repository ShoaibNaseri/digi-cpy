import React, { useEffect } from 'react'
import Navbar from '../../components/landingPage/Navbar/Navbar.jsx'
import LandingPageFooter from '../../pages/landing/components/LandingPageFooter.jsx'
import './PrivacyPolicyPage.css'
import { transform } from 'lodash'

const PrivacyPolicyPage = () => {
  useEffect(() => {
    // Set page title and meta description
    document.title = 'Privacy Policy | Digipalz'

    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Digipalz Privacy Policy - Learn how we protect your personal information and comply with COPPA, PIPEDA, FERPA, and GDPR regulations.'
      )
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content =
        'Digipalz Privacy Policy - Learn how we protect your personal information and comply with COPPA, PIPEDA, FERPA, and GDPR regulations.'
      document.head.appendChild(meta)
    }
  }, [])

  return (
    <div className='digipalz-privacy-policy__main-container'>
      <div className='digipalz-privacy-policy__content'>
        {/* Hero Section */}
        <div className='digipalz-privacy-policy__hero'>
          <div className='digipalz-privacy-policy__hero-content'>
            <h1 className='digipalz-privacy-policy__hero-title'>
              Privacy Policy
            </h1>
            <p className='digipalz-privacy-policy__hero-subtitle'>
              Effective Date: October 6, 2025
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className='digipalz-privacy-policy__main-content'>
          <div className='digipalz-privacy-policy__content-wrapper'>
            <div className='digipalz-privacy-policy__introduction'>
              <p>
                This Privacy Policy ("Policy") sets forth the manner in which{' '}
                <strong>Digipalz Corp.</strong> ("Digipalz," "we," "us," or
                "our") collects, uses, discloses, and protects personal
                information obtained through our digital-safety education
                platform and related services, including the Digipalz website,
                dashboards, and Unity-based learning games (collectively, the
                "Services").
              </p>
              <p>
                Digipalz Corp. is a corporation organized under the laws of the{' '}
                <strong>State of Delaware, United States</strong>, with its
                principal office located at{' '}
                <strong>
                  3984, 1007 N Orange Street, 4th Floor, Wilmington, DE 19801
                </strong>
                . All privacy inquiries should be directed to our{' '}
                <strong>Privacy Officer, Samantha Tenus</strong>, at{' '}
                <a href='mailto:samantha@digipalz.io'>samantha@digipalz.io</a>.
              </p>
              <p>
                This Policy applies to users located in the{' '}
                <strong>United States</strong> and <strong>Canada</strong>, and
                where applicable to users in the <strong>European Union</strong>{' '}
                and <strong>United Kingdom</strong> subject to the General Data
                Protection Regulation ("GDPR") and substantially similar
                frameworks.
              </p>
            </div>

            <div className='digipalz-privacy-policy__section'>
              <h2 className='digipalz-privacy-policy__section-title'>
                I. Commitment to Privacy and Compliance
              </h2>
              <p>
                Digipalz is committed to lawful, transparent, and secure
                handling of all personal information entrusted to it. Our
                practices conform to, and are guided by, the{' '}
                <strong>
                  Children's Online Privacy Protection Act (COPPA)
                </strong>
                ,{' '}
                <strong>
                  Personal Information Protection and Electronic Documents Act
                  (PIPEDA)
                </strong>
                ,{' '}
                <strong>
                  Family Educational Rights and Privacy Act (FERPA)
                </strong>
                , <strong>General Data Protection Regulation (GDPR)</strong>{' '}
                (including child provisions GDPR-K),{' '}
                <strong>Children's Internet Protection Act (CIPA)</strong>, and
                comparable provincial, territorial, and state statutes.
              </p>
            </div>

            <div className='digipalz-privacy-policy__section'>
              <h2 className='digipalz-privacy-policy__section-title'>
                II. Information Collected
              </h2>

              <h3 className='digipalz-privacy-policy__subsection-title'>
                A. Information Provided Directly by Users
              </h3>
              <p>
                Depending upon the user role, Digipalz may collect: names, dates
                of birth, classroom or school identifiers, regional location
                (state, province, territory, or country), parent or teacher
                contact information, billing information processed securely by
                Stripe, and such additional details as are reasonably required
                for account creation and administration. Children are not
                permitted to register accounts independently.
              </p>

              <h3 className='digipalz-privacy-policy__subsection-title'>
                B. Information Collected Automatically
              </h3>
              <p>
                When a user interacts with the Services, Digipalz automatically
                records device and browser type, anonymized IP address and
                approximate location, session duration, page views, mission
                progress, and quiz performance. Cookies and analytics are
                employed to ensure functionality and service optimization;
                non-essential cookies are deployed only where regional law
                requires and consent has been obtained.
              </p>

              <h3 className='digipalz-privacy-policy__subsection-title'>
                C. Information Obtained from Third Parties
              </h3>
              <p>
                Users may authenticate via Google or Facebook, which act as
                independent data controllers for login credentials. Digipalz
                also utilizes third-party processors including Stripe (for
                payments), Firebase and AWS (for hosting and infrastructure),
                EmailJS (for transactional communications), Google Analytics
                (for anonymized web analytics), Meta Pixel (for measurement on
                adult-facing pages only), and Chart.js (for internal data
                visualization). Each processor is contractually bound to use
                personal data solely for its designated function and to maintain
                appropriate safeguards.
              </p>
              <p>
                No advertising, tracking plug-ins, or social-media widgets are
                embedded within the child learning environment.
              </p>
            </div>

            <div className='digipalz-privacy-policy__section'>
              <h2 className='digipalz-privacy-policy__section-title'>
                III. Purposes of Processing
              </h2>
              <p>
                Personal information is processed to operate, maintain, and
                improve the Services; create and manage accounts; authenticate
                users; deliver digital-safety lessons; furnish learning
                analytics to parents, teachers, and schools; process authorized
                payments; and comply with legal and regulatory obligations.
                Personal information is <strong>not</strong> used for behavioral
                advertising or automated decision-making that produces legal or
                similarly significant effects.
              </p>
            </div>

            <div className='digipalz-privacy-policy__section'>
              <h2 className='digipalz-privacy-policy__section-title'>
                IV. Communications
              </h2>
              <p>Digipalz communicates with:</p>
              <ul className='digipalz-privacy-policy__list'>
                <li>
                  <strong>Parents and Guardians</strong> regarding account
                  setup, progress reports, billing, renewals, and optional
                  newsletters;
                </li>
                <li>
                  <strong>Teachers and Administrators</strong> regarding
                  onboarding, curriculum updates, feature releases, and optional
                  professional newsletters; and
                </li>
                <li>
                  <strong>Students</strong> through in-platform notifications
                  limited to gameplay instructions and feedback.
                </li>
              </ul>
              <p>
                Marketing communications are limited to parents and educators
                and include a clear means of opting out at any time.
              </p>
            </div>

            <div className='digipalz-privacy-policy__section'>
              <h2 className='digipalz-privacy-policy__section-title'>
                V. Lawful Basis for Processing
              </h2>
              <p>
                Processing is grounded in one or more lawful bases: (a) the
                consent of a parent, guardian, or institutional representative;
                (b) legitimate educational interest or contractual necessity
                when Digipalz acts as a processor for schools; and (c) legal
                obligation under privacy, education, or child-protection
                statutes.
              </p>
            </div>

            <div className='digipalz-privacy-policy__section'>
              <h2 className='digipalz-privacy-policy__section-title'>
                VI. Parental and School Consent
              </h2>
              <p>
                Accounts for minors may be created only by verified parents or
                guardians, or by educational institutions acting with lawful
                authority. Where permitted by law, a school board or district
                may provide consent on behalf of guardians pursuant to FERPA,
                PIPEDA, or equivalent legislation. All child data used for
                internal analytics is pseudonymized. Digipalz relies upon the
                representations and agreements of the consenting adult or
                institution and does not independently verify legal authority
                beyond reasonable documentation.
              </p>
            </div>

            <div className='digipalz-privacy-policy__section'>
              <h2 className='digipalz-privacy-policy__section-title'>
                VII. Data Sharing and Cross-Border Transfers
              </h2>
              <p>
                Personal information may be processed or stored in Canada (North
                America Northeast), the United States (us-central region), or
                the United Kingdom (europe-west region), depending upon the
                user's location. Cross-border transfers are effected under
                Standard Contractual Clauses (SCCs) or other recognized
                safeguards ensuring adequate protection of personal information.
                Digipalz does not sell, rent, or otherwise disclose personal
                information to advertisers, brokers, or unrelated third parties.
              </p>
            </div>

            <div className='digipalz-privacy-policy__section'>
              <h2 className='digipalz-privacy-policy__section-title'>
                VIII. Data Security
              </h2>
              <p>
                Digipalz employs administrative, technical, and physical
                safeguards commensurate with industry standards, including
                AES-256 encryption at rest, TLS 1.3 encryption in transit,
                role-based access controls restricting identifiable child data
                to the Chief Executive Officer and Head of Technology, enforced
                Firestore security rules, and quarterly security audits. While
                these measures substantially reduce risk, no electronic system
                can be guaranteed to be entirely secure.
              </p>
            </div>

            <div className='digipalz-privacy-policy__section'>
              <h2 className='digipalz-privacy-policy__section-title'>
                IX. Children's Privacy and Safeguarding
              </h2>
              <p>
                Children cannot self-register. All information relating to a
                child is obtained with verifiable parental or institutional
                consent. Digipalz does not host advertising, enable public
                profiles, or facilitate social interaction within its
                educational environment. Parents and schools may access,
                correct, or delete a child's data at any time by using
                in-platform controls or contacting the Privacy Officer. Digipalz
                does not monitor or intercept student communications and
                encourages adults to report suspected online harm encountered
                outside the platform to appropriate authorities.
              </p>
            </div>

            <div className='digipalz-privacy-policy__section'>
              <h2 className='digipalz-privacy-policy__section-title'>
                X. Data Retention and Deletion
              </h2>
              <p>
                Personal information is retained only for as long as is
                reasonably necessary to deliver the Services or as required by
                law. Upon account deletion, all identifiable records are
                permanently and securely erased; limited anonymized data may
                remain for statistical or audit purposes. Requests for deletion
                may be submitted through account settings or by contacting{' '}
                <a href='mailto:samantha@digipalz.io'>samantha@digipalz.io</a>.
              </p>
            </div>

            <div className='digipalz-privacy-policy__section'>
              <h2 className='digipalz-privacy-policy__section-title'>
                XI. Individual Rights
              </h2>
              <p>
                Subject to applicable law, users may request access to,
                correction of, or deletion of their personal information,
                withdraw consent, request data portability, or lodge a complaint
                with the appropriate supervisory authority. Digipalz will
                respond to such requests in accordance with governing law.
              </p>
            </div>

            <div className='digipalz-privacy-policy__section'>
              <h2 className='digipalz-privacy-policy__section-title'>
                XII. Governance and Accountability
              </h2>
              <p>
                Digipalz maintains a comprehensive Privacy Management Program
                overseen by the Privacy Officer. The program includes regular
                Data Protection Impact Assessments (DPIAs), employee privacy
                training, vendor risk assessments and Data Processing Agreements
                (DPAs), and annual reviews to ensure continuing compliance with
                COPPA, PIPEDA, FERPA, GDPR, and CIPA.
              </p>
            </div>

            <div className='digipalz-privacy-policy__section'>
              <h2 className='digipalz-privacy-policy__section-title'>
                XIII. Breach Notification
              </h2>
              <p>
                Should a data breach involving personal information occur,
                Digipalz will notify affected users and, where applicable,
                regulators without undue delay, consistent with obligations
                under PIPEDA and GDPR Article 33.
              </p>
            </div>

            <div className='digipalz-privacy-policy__section'>
              <h2 className='digipalz-privacy-policy__section-title'>
                XIV. Disclaimers and Limitation of Liability
              </h2>
              <p>
                The Services are provided on an{' '}
                <strong>"as is" and "as available"</strong> basis. Digipalz
                makes no representations or warranties of any kind, express or
                implied, including but not limited to warranties of
                merchantability, fitness for a particular purpose, or
                non-infringement.
              </p>
              <p>To the maximum extent permitted by law:</p>
              <ol className='digipalz-privacy-policy__numbered-list'>
                <li>
                  Digipalz shall not be liable for any indirect, incidental,
                  special, consequential, or punitive damages arising out of or
                  relating to this Policy or the use of the Services, even if
                  advised of the possibility of such damages; and
                </li>
                <li>
                  <strong>
                    the aggregate liability of Digipalz for any and all claims
                    relating to this Policy or the Services shall not exceed the
                    greater of (i) one hundred U.S. dollars (US $100) or (ii)
                    the total amount paid by the claimant to Digipalz for the
                    Services during the twelve (12) months preceding the event
                    giving rise to the claim.
                  </strong>
                </li>
              </ol>
              <p>
                This limitation applies regardless of the legal theory of
                liability and survives termination of the Policy or any
                agreement between the parties. Nothing herein limits liability
                that cannot lawfully be excluded under applicable law.
              </p>
              <p>
                Users are responsible for maintaining the confidentiality of
                their login credentials and for all activity under their
                accounts.
              </p>
            </div>

            <div className='digipalz-privacy-policy__section'>
              <h2 className='digipalz-privacy-policy__section-title'>
                XV. Governing Law and Jurisdiction
              </h2>
              <p>
                This Policy and any dispute arising hereunder shall be governed
                by and construed in accordance with the laws of the{' '}
                <strong>State of Delaware, United States</strong>, without
                regard to conflict-of-law principles. Exclusive jurisdiction and
                venue shall reside in the state and federal courts located
                within Delaware.
              </p>
            </div>

            <div className='digipalz-privacy-policy__section'>
              <h2 className='digipalz-privacy-policy__section-title'>
                XVI. Amendments, User Acknowledgment, and Contact Information
              </h2>
              <p>
                Digipalz may revise this Policy from time to time. Material
                changes will be communicated in advance via email or in-app
                notification; non-material changes take effect upon posting.
                Continued use of the Services after such changes constitutes
                acceptance of the revised Policy.
              </p>
              <p>
                <strong>User Acknowledgment.</strong> By creating an account,
                registering for, accessing, or otherwise using the Services,
                each user (1) acknowledges that they have read this Privacy
                Policy in its entirety; (2) understands and agrees to be bound
                by its terms; and (3) accepts sole responsibility for reviewing
                this Policy periodically to remain informed of any changes.
                Continued use of the Services after posting of an updated Policy
                shall constitute affirmative acceptance of the revisions.
              </p>
              <p>
                <strong>Contact Information:</strong> Digipalz Corp., 3984 –
                1007 N Orange Street, 4th Floor, Wilmington, DE 19801. Privacy
                Officer: Samantha Tenus. Email:{' '}
                <a href='mailto:samantha@digipalz.io'>samantha@digipalz.io</a>.
              </p>
            </div>

            <div className='digipalz-privacy-policy__compliance-section'>
              <p>
                <strong>Compliance Statement:</strong> Digipalz complies with
                COPPA, PIPEDA, FERPA, and CIPA. Digipalz is not presently ISO or
                SOC certified.
              </p>
              <p>
                <strong>
                  Confidential – For School Board and Regulatory Review
                </strong>
              </p>
              <p>© 2025 Digipalz Corp. All Rights Reserved.</p>
            </div>
          </div>
        </div>
      </div>

      <LandingPageFooter style={{ paddingBottom: '0' }} />
    </div>
  )
}

export default PrivacyPolicyPage
