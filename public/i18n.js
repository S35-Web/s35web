/**
 * S-35 Website i18n — English & Spanish
 */
(function (global) {
    const STORAGE_KEY = 's35_lang';
    const LEGACY_KEYS = { global: 'en', mexico: 'es' };

    const STRINGS = {
        en: {
            meta: {
                indexTitle: 'S-35 | Construction Technology',
                indexDescription: 'S-35 Technology: Leader in construction technology. Innovative products like stucco, plastic cement, porcelain, and more. Pre-mixed dry formulas, just add water.',
                catalogTitle: 'Product Catalog | S-35 Construction Technology',
                catalogDescription: 'Complete S-35 product catalog: stucco, plastic cement, porcelain, basecoat, Styrobond and more. Pre-mixed dry formulas, just add water.',
                learnTitle: 'Learn More | S-35 Construction Technology',
                learnDescription: 'Discover how pre-formulated products revolutionize construction quality and efficiency.',
                mlHomeTitle: 'MateriaLab — Materials Research & Development | S-35',
                mlHomeDescription: 'Open archive of S-35 raw-material characterisation. Aggregates, fillers and binders documented with provenance.',
                mlMaterialsTitle: 'Material Index — MateriaLab | S-35',
                mlMaterialsDescription: 'Index of documented and in-study raw materials at MateriaLab, S-35’s materials research division.',
                mlResearchTitle: 'Research Index — MateriaLab | S-35',
                mlResearchDescription: 'Index of MateriaLab research on aggregates, fillers and binders.',
                mlMethodologyTitle: 'Methodology — MateriaLab | S-35',
                mlMethodologyDescription: 'How MateriaLab characterises raw materials: origin, sample, classification, measurement, documentation. No unconfirmed accreditations.',
                mlAboutTitle: 'What MateriaLab is — and what it is not | S-35',
                mlAboutDescription: 'MateriaLab is an open raw-material characterisation archive. It is not an accredited laboratory and not an S-35 product specification.'
            },
            nav: { login: 'Login', news: 'News', catalog: 'Catalog', materialab: 'MateriaLab', contact: 'Contact', back: 'Back' },
            hero: {
                title1: 'Technology',
                title2: 'in materials.',
                subtitle: 'ECOLOGY, INNOVATION, HUMANITY & TECHNOLOGY.',
                scroll: 'DISCOVER OUR FORMULAS'
            },
            vision: {
                header: 'OUR VISION',
                title: 'Creating formulas that inspire, support, and strengthen the construction industry.',
                desc: 'We formulate a wide range of products using the highest quality aggregates, integrated with our technology in adhesives, water repellents, and cutting-edge additives, with <strong>the goal of developing unique formulas with outstanding performance.</strong>',
                commitment: 'Reaffirming our commitment to offering innovative solutions and superior quality in the construction sector.'
            },
            formulas: {
                section: 'OUR FORMULAS',
                title: 'Traditional processes, formulated in the laboratory.'
            },
            cards: {
                '1': { title: 'Premium Stucco', desc: 'Advanced formula for high-quality finishes with exceptional durability and professional finish.' },
                '2': { title: 'Industrial Basecoat', desc: 'Application base for coating systems with excellent adhesion and resistance.' },
                '3': { title: 'Textured Finish', desc: 'Special finishes with unique textures for cutting-edge architectural projects.' },
                '4': { title: 'Complete System', desc: 'Complete solution that combines base, stucco, and finish for professional results.' },
                '5': { title: 'Specialized Formula', desc: 'Custom developments for specific industrial construction needs.' }
            },
            water: {
                title: 'ALL OUR PRODUCTS ARE FORMULATED DRY, JUST ADD WATER AND READY.',
                stat1: 'Just add water',
                stat2: 'More accurate formulas',
                desc: 'Pre-mixed dry formulas, being carefully crafted under controlled laboratory conditions, ensure 98% consistency compared to on-site mixing.',
                cta: 'LEARN MORE'
            },
            process: {
                title: 'MIXING PROCESS',
                main: 'Molecular precision in every formulation',
                desc: 'Our controlled mixing process ensures perfect consistency in every batch, using cutting-edge technology to achieve industrial precision formulations.',
                stat1: 'Molecular precision',
                stat2: 'Quality control',
                f1t: 'Microscopic Analysis',
                f1d: 'Molecular verification of each component',
                f2t: 'Industrial Automation',
                f2d: 'Processes controlled by advanced systems',
                f3t: 'Chemical Formulation',
                f3d: 'Development of high-precision compounds'
            },
            stats: {
                sub: 'RESEARCH',
                title: 'INNOVATION & CONSTRUCTION',
                s1: 'Commercial products',
                s2: 'Formulas created',
                s3: 'Years of experience',
                s4: 'Distributors',
                desc: 'Over the years we have designed 18 line products, available at all times, and more than 60 formulas available on order.'
            },
            products: {
                counter: 'Commercial products',
                title: 'Complete Range of Solutions',
                tagline: 'Every product, an exceptional solution',
                desc: 'From substrate preparation to final finish, our product line covers every stage of the construction process with precision formulations that guarantee superior results in every project.',
                cta: 'EXPLORE CATALOG'
            },
            quality: {
                sub: 'CONTROL',
                title: 'QUALITY<br>GUARANTEES',
                s1l: 'Guaranteed consistency',
                s1d: 'Achieved by just adding water instead of formulating on site, ensuring uniform results in every application.',
                s2l: 'Time efficiency',
                s2d: 'Significant reduction in preparation and application time, optimizing project schedules.',
                s3l: 'Material waste',
                s3d: 'Pre-formulated products have extended shelf life and better material utilization.',
                s4l: 'Quality control',
                s4d: 'Every batch goes through rigorous laboratory testing before going into production.'
            },
            contact: {
                h2: 'Design your future,<br>one formula at a time.',
                h3: 'Join a community of builders shaping tomorrow.',
                p: 'S-35® Your partner in construction excellence.',
                formTitle: 'Send us a message',
                formSub: 'Connect with our team and discover how we can transform your next construction project.',
                name: 'Full name *',
                namePh: 'e.g. John Smith',
                email: 'Email address *',
                emailPh: 'e.g. john@company.com',
                company: 'Company',
                companyPh: 'e.g. ABC Construction',
                message: 'Message *',
                messagePh: 'Tell us about your project...',
                checkbox: 'Connect with our team and discover how we can transform your next construction project. Subscribe to our newsletter and stay informed about our advances.',
                submit: 'Send message',
                terms: 'A specialized advisor will be with you to follow up on your inquiry and provide you with the best solution and/or construction advice.'
            },
            footer: {
                tagline: 'Construction technology for the future',
                products: 'Products',
                catalog: 'Complete Catalog',
                stucco: 'Premium Stucco',
                basecoat: 'Industrial Basecoat',
                finishes: 'Specialized Finishes',
                adhesives: 'High-Strength Adhesives',
                technology: 'Technology',
                lab: 'Research Laboratory',
                manufacturing: 'Manufacturing Processes',
                qc: 'Quality Control',
                innovation: 'Continuous Innovation',
                company: 'Company',
                about: 'About Us',
                history: 'History',
                mission: 'Mission and Vision',
                certs: 'Certifications',
                collaborators: 'Collaborators',
                contactCol: 'Contact',
                form: 'Contact Form',
                distributors: 'Distributors',
                support: 'Technical Support',
                commercial: 'Commercial Inquiries',
                copyright: '© 2025 S-35® Tech Web Team. All rights reserved. | v1.1.7',
                terms: 'Terms of Service',
                privacy: 'Privacy Policy',
                cookies: 'Cookies'
            },
            catalog: {
                home: 'Home',
                catalog: 'Catalog',
                title: 'Catalog',
                subtitle: 'Tap a product to open its technical sheet.',
                all: 'All',
                stucco: 'Stucco',
                basecoat: 'Basecoat',
                finishes: 'Finishes',
                adhesives: 'Adhesives',
                viewDetails: 'View sheet',
                description: 'Description',
                features: 'Technical Features',
                applications: 'Applications',
                requestInfo: 'Request Information',
                downloadSheet: 'Download Technical Sheet',
                categories: { estuco: 'Stucco', basecoat: 'Basecoat', acabados: 'Finishes', adhesivos: 'Adhesives' }
            },
            article: {
                breadcrumb: 'Learn More',
                title1: 'Why pre-formulated',
                title2: 'products',
                title3: 'revolutionize construction',
                date: 'December 2024',
                readTime: '5 min read',
                lead: 'Discover how laboratory-developed formulas transform efficiency and quality in construction. In traditional construction, on-site material mixing has been common for decades. However, this approach presents significant challenges that directly impact project quality, efficiency, and profitability.',
                s1t: 'The problem with traditional on-site mixing',
                s1p: 'When materials are mixed directly on site, multiple factors can compromise the final product quality:',
                p1t: 'Inconsistent proportions',
                p1d: 'Manual measurements can vary significantly between workers and workdays.',
                p2t: 'Variable environmental conditions',
                p2d: 'Humidity, temperature, and water quality can unpredictably affect the final result.',
                p3t: 'Limited working time',
                p3d: 'On-site mixed products have a shorter shelf life, generating waste.',
                p4t: 'Difficult quality control',
                p4d: 'It is complex to guarantee that every batch has the same characteristics and performance.',
                s2t: 'The solution: Laboratory pre-formulated products',
                s2p: 'S-35 products are formulated under controlled laboratory conditions, where every variable can be measured, controlled, and optimized for consistent, superior results.',
                c1t: 'Guaranteed consistency',
                c1d: 'Each product maintains the same physical and chemical characteristics, regardless of batch or production date.',
                c2t: 'Time efficiency',
                c2d: 'Significant reduction in preparation and application time, optimizing project schedules.',
                c3t: 'Material waste',
                c3d: 'Pre-formulated products have extended shelf life and better material utilization.',
                c4t: 'Quality control',
                c4d: 'Every batch goes through rigorous laboratory testing before production.',
                s3t: 'Impact on the construction industry',
                s3p: 'Adopting pre-formulated products is transforming the construction industry, generating tangible benefits:',
                i1t: 'Cleaner job sites',
                i1d: 'Less dust, less waste, and a healthier work environment for crews.',
                i2t: 'Greater efficiency',
                i2d: 'Optimized processes that reduce construction time and operating costs.',
                i3t: 'Precise formulas',
                i3d: 'Predictable, consistent results that meet the most demanding quality standards.',
                i4t: 'Sustainability',
                i4d: 'Reduced environmental impact through less waste and more efficient processes.',
                s4t: 'The future of construction',
                s4p: 'At S-35, we believe the future of construction lies in technological innovation applied to traditional materials. Our pre-formulated products bridge traditional building wisdom with modern demands for efficiency and quality.',
                quote: '"The construction of the future is not about replacing the traditional, but perfecting it through science and technology."',
                cite: '— S-35 Research & Development Team',
                ctaTitle: 'Ready to transform your next project?',
                ctaSub: 'Discover how our products can elevate the quality and efficiency of your project.',
                ctaBtn: 'Contact Specialists'
            },
            ml: {
                navMaterials: 'Materials',
                navResearch: 'Research',
                navMethodology: 'Methodology',
                navAbout: 'About',
                back: '← S-35',
                heroKicker: 'S-35® MATERIAL TECHNOLOGY',
                heroSub: 'Materials Research & Development',
                heroLine: 'We study matter before we turn it into material.',
                heroDesc: 'An open collection of research on minerals, aggregates, binders and raw materials developed by S-35.',
                plateDivision: 'MATERIAL RESEARCH DIVISION',
                manifestoTitle: 'Understanding matter. Building better materials.',
                manifestoP1: 'Every material starts long before it becomes a product. It starts as a particle. Chemical composition, mineralogy, particle size, density, absorption, morphology and provenance determine much of how it behaves.',
                manifestoP2: 'MateriaLab is S-35’s research archive for studying those variables, documenting them and turning that knowledge into better materials.',
                manifestoClose: 'Research informs formulation.<br>Formulation informs performance.',
                indexTitle: 'MATERIAL INDEX',
                materialsH1: 'Materials',
                materialsLede: 'MATERIALS DOCUMENTED. The archive starts small and grows in public.',
                researchTitle: 'RESEARCH INDEX',
                researchH1: 'Research',
                researchLede: 'Published investigations. Filters only show categories that have at least one document.',
                featured: 'FEATURED RESEARCH',
                openFile: 'OPEN RESEARCH FILE →',
                methodology: 'METHODOLOGY',
                methodologyLede: 'MateriaLab uses a progressive method to characterise raw materials before they enter formulated systems.',
                fullMethodology: 'FULL METHODOLOGY →',
                chainTitle: 'FROM MATTER TO MATERIAL',
                chainClose: 'Research is where every S-35 material begins.',
                thCode: 'CODE',
                thName: 'NAME',
                thClass: 'CLASS',
                thOrigin: 'ORIGIN',
                thStatus: 'STATUS',
                thTitle: 'TITLE',
                thCategory: 'CATEGORY',
                thDate: 'DATE',
                thRev: 'REV',
                filterAll: 'ALL',
                scroll: 'SCROLL FOR MORE →',
                footerDivision: 'MATERIAL RESEARCH DIVISION · S-35®',
                footerExpanding: 'THE ARCHIVE IS CONTINUOUSLY EXPANDING.',
                footerDocumented: 'MATERIALS DOCUMENTED',
                footerExperiments: 'EXPERIMENTS',
                footerStudy: 'ACTIVE STUDY',
                footerUpdated: 'LAST UPDATED',
                notFound: 'CODE NOT FOUND IN ARCHIVE — THIS RESEARCH MAY NOT BE PUBLISHED YET',
                packaging: 'SCANNED FROM PACKAGING',
                packagingWelcome: 'WELCOME TO THE ARCHIVE',
                filePrefix: 'MATERIAL RESEARCH FILE',
                metaOrigin: 'ORIGIN',
                metaClass: 'CLASS',
                metaStatus: 'STATUS',
                metaRevision: 'REVISION',
                metaDate: 'DATE',
                metaSample: 'SAMPLE ID',
                scale: 'SCALE 0—1—2—3—4—5 mm · PENDING CALIBRATION AGAINST THIS FRAME · MACROGRAPH IS REAL, SCALE IS NOT YET SURVEYED',
                hSummary: 'Summary',
                hDatasheet: 'Datasheet',
                hParticle: 'Particle Analysis',
                hChemical: 'Chemical Composition',
                hMorphology: 'Morphology',
                hWhy: 'Why It Matters',
                hNotes: 'Lab Notes',
                hExperiments: 'Experiment Log',
                hRevision: 'Revision History',
                hApplication: 'Research Application',
                hRelated: 'Related Research',
                micrography: 'MICROGRAPHY',
                microPending: 'PENDING — SEM imaging not yet performed',
                download: 'DOWNLOAD RESEARCH FILE / PDF',
                disclaimer: 'Raw-material characterisation data published in MateriaLab is for information and technical disclosure. It is not a product specification, technical data sheet or performance warranty for any S-35 product.',
                applicationLead: 'This characterisation informs S-35 material systems.',
                dsProperty: 'PROPERTY',
                dsValue: 'VALUE',
                dsProv: 'PROV.',
                dsMethod: 'METHOD / SOURCE',
                dsOrigin: 'Origin',
                dsBulk: 'Bulk density',
                dsSg: 'Specific gravity',
                dsHardness: 'Hardness (Mohs)',
                dsAbsorption: 'Water absorption',
                dsPorosity: 'Porosity',
                dsColour: 'Colour',
                dsStructure: 'Structure',
                dsMaxSize: 'Maximum size',
                dsFm: 'Fineness modulus',
                dsGrain: 'Grain range',
                dsWhiteness: 'Whiteness',
                dsCalcination: 'Calcination temperature',
                dsKiln: 'Kiln temperature',
                dsPh: 'pH (saturated / fresh paste)',
                dsSet: 'Initial set',
                dsStrength: 'Strength class',
                dsWc: 'Water/cement ratio',
                dsSurface: 'Surface',
                dsGeometry: 'Geometry',
                dsEdge: 'Edge profile',
                notMeasured: 'NOT YET MEASURED',
                chartPsd: 'PARTICLE SIZE DISTRIBUTION',
                chartPsdPending: 'PARTICLE SIZE DISTRIBUTION — SAMPLE CURVE NOT YET MEASURED',
                chartEnvelope: 'DASHED ENVELOPE ASTM C33 FINE AGGREGATE (REF)',
                chartX: 'PARTICLE SIZE (mm) · LOG',
                chartY: '% PASSING',
                aboutLabel: 'WHAT MATERIALAB IS — AND WHAT IT IS NOT',
                aboutTitle: 'What MateriaLab is — and what it is not',
                aboutWhat: 'What it is',
                aboutWhatP: 'MateriaLab is an open raw-material characterisation archive built by S-35. It publishes what is observed and measured on minerals, aggregates, binders and fillers <em>before</em> they become a product. The order is deliberate: knowledge first, then authority, then brand, then product.',
                aboutNot: 'What it is not',
                aboutNotP: 'MateriaLab is not an accredited laboratory. It is not a certification body. It is not a product-specification source. Characterisation data <strong>does not constitute a technical specification or a performance warranty</strong> for any S-35 product.',
                aboutHow: 'How data is obtained',
                aboutHowP: 'Every publishable value carries a provenance label. If a number has no provenance, the archive does not publish it — the build fails.',
                aboutMeas: 'measured by S-35 on an identified sample, with a date.',
                aboutRef: 'taken from literature, a standard or a supplier sheet, always with a source.',
                aboutObs: 'uninstrumented internal observation (sight or visual reference).',
                aboutHyp: 'working hypothesis.',
                aboutWip: 'test started, no conclusion; the table reads NOT YET MEASURED.',
                aboutFirst: 'The first files combine a visual reference of typical appearance with typical standard or trade profiles, labelled REF. Where the lot was not tested, the field is empty on purpose.',
                aboutPublishes: 'MateriaLab publishes <em>what is known about the raw material</em>. It does not publish what S-35 does with it: no dosages, no production target curves, no suppliers.',
                methodLabel: 'METHODOLOGY',
                methodTitle: 'How materials are studied',
                methodLede: 'MateriaLab uses a progressive method to characterise raw materials before evaluating them in formulated systems. We do not claim accreditations, equipment or standards we have not run on the published sample.',
                methodClose: 'If a test was done in an outside lab, the lab is named or the text says “external laboratory”. That fact is never omitted to imply in-house capacity. This first publication has no instrumented lot tests: there is a visual reference, observation and a normative reference.',
                step1: 'SOURCE',
                step1p: 'The region of origin is declared. Quarry and supplier are not published.',
                step2: 'SAMPLE',
                step2p: 'The material is recorded with a code (ML-SMP) and a visual reference of typical appearance.',
                step3: 'CLASSIFY',
                step3p: 'A category (AGG, BND, FIL…) and a sequential code are assigned. Codes are not reused.',
                step4: 'MEASURE',
                step4p: 'Instrumented tests, with a standard or method and a date. If there is no test, the field stays empty.',
                step5: 'TEST',
                step5p: 'Tests on one or more samples (ML-EXP). Only experiments that exist are listed.',
                step6: 'FORMULATE',
                step6p: 'The knowledge informs formulation. Formulation is not published here.',
                step7: 'VALIDATE',
                step7p: 'Internal review before a file moves from IN STUDY to DOCUMENTED.',
                step8: 'DOCUMENT',
                step8p: 'A public file with provenance, revision and disclaimer. The archive updates in public.',
                chainMineral: 'MINERAL',
                chainAggregate: 'AGGREGATE',
                chainFormulation: 'FORMULATION',
                chainMaterial: 'MATERIAL',
                chainSurface: 'SURFACE',
                chainArchitecture: 'ARCHITECTURE',
                catAGG: 'AGGREGATES',
                catBND: 'BINDERS',
                catFIL: 'FILLERS',
                catMIN: 'MINERALS',
                catADM: 'ADMIXTURES',
                catPIG: 'PIGMENTS',
                catFIB: 'FIBERS',
                catSingularAGG: 'Aggregate',
                catSingularBND: 'Binder',
                catSingularFIL: 'Filler',
                ftBrand: 'MATERIALAB · S-35® · CHARACTERISATION ARCHIVE',
                ftFigA: 'FIG. A · VISUAL REFERENCE',
                ftChemName: 'CHEMICAL NAME',
                ftFamily: 'FAMILY',
                ftHeadline: 'HEADER DATA',
                ftParam: 'PARAMETER',
                ftTypical: 'TYPICAL VALUE',
                ftPractical: 'IN PRACTICAL TERMS',
                ftNorm: 'STANDARD / SOURCE',
                ftOxide: 'OXIDE',
                ftRange: 'RANGE %',
                ftId: 'Identification',
                ftComp: 'Composition',
                ftProps: 'Properties and what they mean',
                ftDoc: 'TECHNICAL DOCUMENT',
                ftOpen: 'OPEN ARCHIVE',
                ftAviso: 'NOTICE'
            }
        },
        es: {
            meta: {
                indexTitle: 'S-35 | Tecnología en Construcción',
                indexDescription: 'S-35 Technology: Líder en tecnología de construcción. Productos innovadores como estuco, cemento plástico, porcelánico y más. Fórmulas secas premezcladas, solo agrega agua.',
                catalogTitle: 'Catálogo de Productos | S-35 Tecnología en Construcción',
                catalogDescription: 'Catálogo completo S-35: estuco, cemento plástico, porcelánico, basecoat, Styrobond y más. Fórmulas secas premezcladas, solo agrega agua.',
                learnTitle: 'Conoce Más | S-35 Tecnología en Construcción',
                learnDescription: 'Descubre cómo los productos pre-formulados revolucionan la calidad y eficiencia en la construcción.',
                mlHomeTitle: 'MateriaLab — Investigación y desarrollo de materiales | S-35',
                mlHomeDescription: 'Archivo abierto de caracterización de materias primas de S-35. Agregados, cargas y cementantes documentados con procedencia.',
                mlMaterialsTitle: 'Índice de materiales — MateriaLab | S-35',
                mlMaterialsDescription: 'Índice de materias primas documentadas y en estudio en MateriaLab, la división de investigación de materiales de S-35.',
                mlResearchTitle: 'Índice de investigación — MateriaLab | S-35',
                mlResearchDescription: 'Índice de investigaciones de MateriaLab sobre agregados, cargas y cementantes.',
                mlMethodologyTitle: 'Metodología — MateriaLab | S-35',
                mlMethodologyDescription: 'Cómo MateriaLab caracteriza materias primas: origen, muestra, clasificación, medición, documentación. Sin acreditaciones no confirmadas.',
                mlAboutTitle: 'Qué es MateriaLab — y qué no es | S-35',
                mlAboutDescription: 'MateriaLab es un archivo abierto de caracterización de materias primas. No es un laboratorio acreditado ni una especificación de producto S-35.'
            },
            nav: { login: 'Iniciar sesión', news: 'Noticias', catalog: 'Catálogo', materialab: 'MateriaLab', contact: 'Contacto', back: 'Volver' },
            hero: {
                title1: 'Tecnología',
                title2: 'en materiales.',
                subtitle: 'ECOLOGÍA, INNOVACIÓN, HUMANIDAD Y TECNOLOGÍA.',
                scroll: 'DESCUBRE NUESTRAS FÓRMULAS'
            },
            vision: {
                header: 'NUESTRA VISIÓN',
                title: 'Crear fórmulas que inspiren, respalden y fortalezcan la industria de la construcción.',
                desc: 'Formulamos una amplia gama de productos con agregados de la más alta calidad, integrados con nuestra tecnología en adhesivos, repelentes de agua y aditivos de vanguardia, con <strong>el objetivo de desarrollar fórmulas únicas con un desempeño excepcional.</strong>',
                commitment: 'Reafirmando nuestro compromiso de ofrecer soluciones innovadoras y calidad superior en el sector de la construcción.'
            },
            formulas: {
                section: 'NUESTRAS FÓRMULAS',
                title: 'Procesos tradicionales, formulados en el laboratorio.'
            },
            cards: {
                '1': { title: 'Estuco Premium', desc: 'Fórmula avanzada para acabados de alta calidad con durabilidad excepcional y terminado profesional.' },
                '2': { title: 'Basecoat Industrial', desc: 'Base de aplicación para sistemas de recubrimiento con excelente adherencia y resistencia.' },
                '3': { title: 'Acabado Texturizado', desc: 'Acabados especiales con texturas únicas para proyectos arquitectónicos de vanguardia.' },
                '4': { title: 'Sistema Completo', desc: 'Solución integral que combina base, estuco y acabado para resultados profesionales.' },
                '5': { title: 'Fórmula Especializada', desc: 'Desarrollos a medida para necesidades específicas de construcción industrial.' }
            },
            water: {
                title: 'TODOS NUESTROS PRODUCTOS SE FORMULAN EN SECO, SOLO AGREGA AGUA Y LISTO.',
                stat1: 'Solo agrega agua',
                stat2: 'Fórmulas más precisas',
                desc: 'Las fórmulas secas premezcladas, elaboradas bajo condiciones controladas de laboratorio, garantizan un 98% de consistencia frente a la mezcla en obra.',
                cta: 'CONOCE MÁS'
            },
            process: {
                title: 'PROCESO DE MEZCLADO',
                main: 'Precisión molecular en cada formulación',
                desc: 'Nuestro proceso de mezclado controlado asegura consistencia perfecta en cada lote, usando tecnología de punta para lograr formulaciones de precisión industrial.',
                stat1: 'Precisión molecular',
                stat2: 'Control de calidad',
                f1t: 'Análisis Microscópico',
                f1d: 'Verificación molecular de cada componente',
                f2t: 'Automatización Industrial',
                f2d: 'Procesos controlados por sistemas avanzados',
                f3t: 'Formulación Química',
                f3d: 'Desarrollo de compuestos de alta precisión'
            },
            stats: {
                sub: 'INVESTIGACIÓN',
                title: 'INNOVACIÓN Y CONSTRUCCIÓN',
                s1: 'Productos comerciales',
                s2: 'Fórmulas creadas',
                s3: 'Años de experiencia',
                s4: 'Distribuidores',
                desc: 'A lo largo de los años hemos diseñado 18 productos de línea, disponibles en todo momento, y más de 60 fórmulas disponibles bajo pedido.'
            },
            products: {
                counter: 'Productos comerciales',
                title: 'Gama Completa de Soluciones',
                tagline: 'Cada producto, una solución excepcional',
                desc: 'Desde la preparación del sustrato hasta el acabado final, nuestra línea cubre cada etapa del proceso constructivo con formulaciones de precisión que garantizan resultados superiores en cada proyecto.',
                cta: 'EXPLORAR CATÁLOGO'
            },
            quality: {
                sub: 'CONTROL',
                title: 'GARANTÍAS<br>DE CALIDAD',
                s1l: 'Consistencia garantizada',
                s1d: 'Lograda al solo agregar agua en lugar de formular en obra, asegurando resultados uniformes en cada aplicación.',
                s2l: 'Eficiencia en tiempo',
                s2d: 'Reducción significativa en tiempo de preparación y aplicación, optimizando cronogramas de obra.',
                s3l: 'Desperdicio de material',
                s3d: 'Los productos pre-formulados tienen mayor vida útil y mejor aprovechamiento del material.',
                s4l: 'Control de calidad',
                s4d: 'Cada lote pasa por rigurosas pruebas de laboratorio antes de entrar a producción.'
            },
            contact: {
                h2: 'Diseña tu futuro,<br>una fórmula a la vez.',
                h3: 'Únete a una comunidad de constructores que moldean el mañana.',
                p: 'S-35® Tu aliado en excelencia constructiva.',
                formTitle: 'Envíanos un mensaje',
                formSub: 'Conecta con nuestro equipo y descubre cómo podemos transformar tu próximo proyecto de construcción.',
                name: 'Nombre completo *',
                namePh: 'ej. Juan Pérez',
                email: 'Correo electrónico *',
                emailPh: 'ej. juan@empresa.com',
                company: 'Empresa',
                companyPh: 'ej. Constructora ABC',
                message: 'Mensaje *',
                messagePh: 'Cuéntanos sobre tu proyecto...',
                checkbox: 'Conecta con nuestro equipo y descubre cómo podemos transformar tu próximo proyecto. Suscríbete a nuestro boletín y mantente informado de nuestros avances.',
                submit: 'Enviar mensaje',
                terms: 'Un asesor especializado dará seguimiento a tu consulta y te brindará la mejor solución y/o asesoría en construcción.'
            },
            footer: {
                tagline: 'Tecnología en construcción para el futuro',
                products: 'Productos',
                catalog: 'Catálogo Completo',
                stucco: 'Estuco Premium',
                basecoat: 'Basecoat Industrial',
                finishes: 'Acabados Especializados',
                adhesives: 'Adhesivos de Alta Resistencia',
                technology: 'Tecnología',
                lab: 'Laboratorio de Investigación',
                manufacturing: 'Procesos de Manufactura',
                qc: 'Control de Calidad',
                innovation: 'Innovación Continua',
                company: 'Empresa',
                about: 'Nosotros',
                history: 'Historia',
                mission: 'Misión y Visión',
                certs: 'Certificaciones',
                collaborators: 'Colaboradores',
                contactCol: 'Contacto',
                form: 'Formulario de Contacto',
                distributors: 'Distribuidores',
                support: 'Soporte Técnico',
                commercial: 'Consultas Comerciales',
                copyright: '© 2025 S-35® Tech Web Team. Todos los derechos reservados. | v1.1.7',
                terms: 'Términos de Servicio',
                privacy: 'Política de Privacidad',
                cookies: 'Cookies'
            },
            catalog: {
                home: 'Inicio',
                catalog: 'Catálogo',
                title: 'Catálogo',
                subtitle: 'Toque un producto para abrir su ficha técnica.',
                all: 'Todos',
                stucco: 'Estuco',
                basecoat: 'Basecoat',
                finishes: 'Acabados',
                adhesives: 'Adhesivos',
                viewDetails: 'Ver ficha',
                description: 'Descripción',
                features: 'Características Técnicas',
                applications: 'Aplicaciones',
                requestInfo: 'Solicitar Información',
                downloadSheet: 'Descargar Ficha Técnica',
                categories: { estuco: 'Estuco', basecoat: 'Basecoat', acabados: 'Acabados', adhesivos: 'Adhesivos' }
            },
            article: {
                breadcrumb: 'Conoce Más',
                title1: 'Por qué los productos',
                title2: 'pre-formulados',
                title3: 'revolucionan la construcción',
                date: 'Diciembre 2024',
                readTime: '5 min de lectura',
                lead: 'Descubre cómo las fórmulas desarrolladas en laboratorio transforman la eficiencia y calidad en la construcción. En la construcción tradicional, la mezcla de materiales en obra ha sido una práctica común durante décadas. Sin embargo, esta metodología presenta desafíos significativos que impactan directamente en la calidad, eficiencia y rentabilidad de los proyectos.',
                s1t: 'El problema de la mezcla tradicional en obra',
                s1p: 'Cuando los materiales se mezclan directamente en la obra, múltiples factores pueden comprometer la calidad final del producto:',
                p1t: 'Inconsistencia en las proporciones',
                p1d: 'Las mediciones manuales pueden variar significativamente entre diferentes trabajadores y días de trabajo.',
                p2t: 'Condiciones ambientales variables',
                p2d: 'La humedad, temperatura y calidad del agua pueden afectar el resultado final de manera impredecible.',
                p3t: 'Tiempo de trabajo limitado',
                p3d: 'Los productos mezclados en obra tienen un tiempo de vida útil reducido, generando desperdicio.',
                p4t: 'Difícil control de calidad',
                p4d: 'Es complejo garantizar que cada lote tenga las mismas características y rendimiento.',
                s2t: 'La solución: Productos pre-formulados en laboratorio',
                s2p: 'Los productos S-35 son formulados en condiciones controladas de laboratorio, donde cada variable puede ser medida, controlada y optimizada para obtener resultados consistentes y superiores.',
                c1t: 'Consistencia garantizada',
                c1d: 'Cada producto mantiene las mismas características físicas y químicas, independientemente del lote o fecha de producción.',
                c2t: 'Eficiencia en tiempo',
                c2d: 'Reducción significativa en el tiempo de preparación y aplicación, optimizando los cronogramas de obra.',
                c3t: 'Desperdicio de material',
                c3d: 'Los productos pre-formulados tienen tiempos de vida útil extendidos y mejor aprovechamiento del material.',
                c4t: 'Control de calidad',
                c4d: 'Cada lote pasa por rigurosas pruebas de laboratorio antes de salir a producción.',
                s3t: 'Impacto en la industria de la construcción',
                s3p: 'La adopción de productos pre-formulados está transformando la industria de la construcción, generando beneficios tangibles:',
                i1t: 'Obras más limpias',
                i1d: 'Menos polvo, menos residuos y un ambiente de trabajo más saludable para los trabajadores.',
                i2t: 'Mayor eficiencia',
                i2d: 'Procesos optimizados que reducen tiempos de construcción y costos operativos.',
                i3t: 'Fórmulas certeras',
                i3d: 'Resultados predecibles y consistentes que cumplen con los estándares de calidad más exigentes.',
                i4t: 'Sostenibilidad',
                i4d: 'Reducción del impacto ambiental a través de menor desperdicio y procesos más eficientes.',
                s4t: 'El futuro de la construcción',
                s4p: 'En S-35, creemos que el futuro de la construcción está en la innovación tecnológica aplicada a materiales tradicionales. Nuestros productos pre-formulados representan un puente entre la sabiduría constructiva tradicional y las exigencias modernas de eficiencia y calidad.',
                quote: '"La construcción del futuro no se trata de reemplazar lo tradicional, sino de perfeccionarlo a través de la ciencia y la tecnología."',
                cite: '— Equipo de Investigación y Desarrollo S-35',
                ctaTitle: '¿Listo para transformar tu próxima obra?',
                ctaSub: 'Descubre cómo nuestros productos pueden elevar la calidad y eficiencia de tu proyecto.',
                ctaBtn: 'Contactar Especialistas'
            },
            ml: {
                navMaterials: 'Materiales',
                navResearch: 'Investigación',
                navMethodology: 'Metodología',
                navAbout: 'Acerca de',
                back: '← S-35',
                heroKicker: 'S-35® TECNOLOGÍA EN MATERIALES',
                heroSub: 'Investigación y desarrollo de materiales',
                heroLine: 'Estudiamos la materia antes de convertirla en material.',
                heroDesc: 'Una colección abierta de investigaciones sobre minerales, agregados, cementantes y materias primas desarrollada por S-35.',
                plateDivision: 'DIVISIÓN DE INVESTIGACIÓN DE MATERIALES',
                manifestoTitle: 'Entender la materia. Construir mejores materiales.',
                manifestoP1: 'Cada material empieza mucho antes de convertirse en un producto. Empieza en una partícula. Su composición química, mineralogía, granulometría, densidad, absorción, morfología y procedencia determinan gran parte de su comportamiento.',
                manifestoP2: 'MateriaLab es el archivo de investigación de S-35 dedicado a estudiar estas variables, documentarlas y convertir ese conocimiento en mejores materiales.',
                manifestoClose: 'La investigación informa la formulación.<br>La formulación informa el desempeño.',
                indexTitle: 'ÍNDICE DE MATERIALES',
                materialsH1: 'Materiales',
                materialsLede: 'MATERIALES DOCUMENTADOS. El archivo empieza pequeño y crece a la vista.',
                researchTitle: 'ÍNDICE DE INVESTIGACIÓN',
                researchH1: 'Investigación',
                researchLede: 'Investigaciones publicadas. Los filtros solo muestran categorías con al menos un documento.',
                featured: 'INVESTIGACIÓN DESTACADA',
                openFile: 'ABRIR FICHA →',
                methodology: 'METODOLOGÍA',
                methodologyLede: 'MateriaLab utiliza una metodología progresiva para caracterizar materias primas antes de evaluar su incorporación a sistemas formulados.',
                fullMethodology: 'METODOLOGÍA COMPLETA →',
                chainTitle: 'DE LA MATERIA AL MATERIAL',
                chainClose: 'La investigación es donde empieza cada material S-35.',
                thCode: 'CÓDIGO',
                thName: 'NOMBRE',
                thClass: 'CLASE',
                thOrigin: 'ORIGEN',
                thStatus: 'ESTADO',
                thTitle: 'TÍTULO',
                thCategory: 'CATEGORÍA',
                thDate: 'FECHA',
                thRev: 'REV',
                filterAll: 'TODOS',
                scroll: 'DESPLAZA PARA VER MÁS →',
                footerDivision: 'DIVISIÓN DE INVESTIGACIÓN DE MATERIALES · S-35®',
                footerExpanding: 'EL ARCHIVO SE EXPANDE DE FORMA CONTINUA.',
                footerDocumented: 'MATERIALES DOCUMENTADOS',
                footerExperiments: 'EXPERIMENTOS',
                footerStudy: 'EN ESTUDIO',
                footerUpdated: 'ÚLTIMA ACTUALIZACIÓN',
                notFound: 'CÓDIGO NO ENCONTRADO EN EL ARCHIVO — ESTA INVESTIGACIÓN PUEDE NO ESTAR PUBLICADA AÚN',
                packaging: 'ESCANEADO DESDE EL EMPAQUE',
                packagingWelcome: 'BIENVENIDO AL ARCHIVO',
                filePrefix: 'FICHA DE INVESTIGACIÓN',
                metaOrigin: 'ORIGEN',
                metaClass: 'CLASE',
                metaStatus: 'ESTADO',
                metaRevision: 'REVISIÓN',
                metaDate: 'FECHA',
                metaSample: 'ID DE MUESTRA',
                scale: 'ESCALA 0—1—2—3—4—5 mm · CALIBRACIÓN PENDIENTE SOBRE ESTE CUADRO · LA MACROFOTOGRAFÍA ES REAL; LA ESCALA AÚN NO ESTÁ LEVANTADA',
                hSummary: 'Resumen',
                hDatasheet: 'Ficha de datos',
                hParticle: 'Análisis granulométrico',
                hChemical: 'Composición química',
                hMorphology: 'Morfología',
                hWhy: 'Por qué importa',
                hNotes: 'Notas de laboratorio',
                hExperiments: 'Registro de experimentos',
                hRevision: 'Historial de revisiones',
                hApplication: 'Aplicación de la investigación',
                hRelated: 'Investigación relacionada',
                micrography: 'MICROGRAFÍA',
                microPending: 'PENDIENTE — aún no hay imagen SEM',
                download: 'DESCARGAR FICHA / PDF',
                disclaimer: 'Los datos de caracterización de materias primas publicados en MateriaLab tienen fines informativos y de divulgación técnica. No constituyen especificación de producto, ficha técnica ni garantía de desempeño de ningún producto S-35.',
                applicationLead: 'Esta caracterización informa sistemas de materiales S-35.',
                dsProperty: 'PROPIEDAD',
                dsValue: 'VALOR',
                dsProv: 'PROV.',
                dsMethod: 'MÉTODO / FUENTE',
                dsOrigin: 'Origen',
                dsBulk: 'Densidad aparente',
                dsSg: 'Densidad relativa',
                dsHardness: 'Dureza (Mohs)',
                dsAbsorption: 'Absorción de agua',
                dsPorosity: 'Porosidad',
                dsColour: 'Color',
                dsStructure: 'Estructura',
                dsMaxSize: 'Tamaño máximo',
                dsFm: 'Módulo de finura',
                dsGrain: 'Rango de grano',
                dsWhiteness: 'Blancura',
                dsCalcination: 'Temperatura de calcinación',
                dsKiln: 'Temperatura de horno',
                dsPh: 'pH (saturado / pasta fresca)',
                dsSet: 'Fraguado inicial',
                dsStrength: 'Clase de resistencia',
                dsWc: 'Relación agua/cemento',
                dsSurface: 'Superficie',
                dsGeometry: 'Geometría',
                dsEdge: 'Perfil de arista',
                notMeasured: 'AÚN NO MEDIDO',
                chartPsd: 'DISTRIBUCIÓN GRANULOMÉTRICA',
                chartPsdPending: 'DISTRIBUCIÓN GRANULOMÉTRICA — CURVA DE MUESTRA AÚN NO MEDIDA',
                chartEnvelope: 'ENVOLVENTE PUNTEADA ASTM C33 AGREGADO FINO (REF)',
                chartX: 'TAMAÑO DE PARTÍCULA (mm) · LOG',
                chartY: '% QUE PASA',
                aboutLabel: 'QUÉ ES MATERIALAB — Y QUÉ NO ES',
                aboutTitle: 'Qué es MateriaLab — y qué no es',
                aboutWhat: 'Qué es',
                aboutWhatP: 'MateriaLab es un archivo abierto de caracterización de materias primas desarrollado por S-35. Publica lo que se observa y se mide sobre minerales, agregados, cementantes y cargas <em>antes</em> de convertirlos en un producto. El orden es deliberado: primero conocimiento, después autoridad, después marca, después producto.',
                aboutNot: 'Qué no es',
                aboutNotP: 'MateriaLab no es un laboratorio acreditado. No es un organismo de certificación. No es una fuente de especificación de producto. Los datos de caracterización <strong>no constituyen especificación técnica ni garantía de desempeño</strong> de ningún producto S-35.',
                aboutHow: 'Cómo se obtienen los datos',
                aboutHowP: 'Cada valor publicable lleva una etiqueta de procedencia. Si un número no tiene procedencia, el archivo no lo publica — el build falla.',
                aboutMeas: 'medido por S-35 sobre una muestra identificada, con fecha.',
                aboutRef: 'tomado de bibliografía, norma o ficha de proveedor, siempre con fuente.',
                aboutObs: 'observación interna no instrumentada (vista o referencia visual).',
                aboutHyp: 'hipótesis de trabajo.',
                aboutWip: 'ensayo iniciado, sin conclusión; en la tabla se lee AÚN NO MEDIDO.',
                aboutFirst: 'Las primeras fichas combinan una referencia visual de presentación habitual con perfiles típicos de norma o de comercio, etiquetados REF. Donde el lote no se ensayó, el campo está vacío a propósito.',
                aboutPublishes: 'MateriaLab publica <em>qué se sabe sobre la materia prima</em>. No publica qué hace S-35 con ella: ni dosificaciones, ni curvas objetivo de producción, ni proveedores.',
                methodLabel: 'METODOLOGÍA',
                methodTitle: 'Cómo se estudian los materiales',
                methodLede: 'MateriaLab utiliza una metodología progresiva para caracterizar materias primas antes de evaluar su incorporación a sistemas formulados. No afirmamos acreditaciones, equipos ni normas que no hayamos ejecutado sobre la muestra publicada.',
                methodClose: 'Si un ensayo se hizo en laboratorio externo, se nombra el laboratorio o se dice “laboratorio externo”. Nunca se omite para insinuar capacidad propia. En esta primera publicación no hay ensayos instrumentados de lote: hay referencia visual, observación y referencia normativa.',
                step1: 'ORIGEN',
                step1p: 'Se declara la región de origen. No se publica cantera ni proveedor.',
                step2: 'MUESTRA',
                step2p: 'Se documenta el material con un código (ML-SMP) y una referencia visual de presentación habitual.',
                step3: 'CLASIFICAR',
                step3p: 'Se asigna categoría (AGG, BND, FIL…) y código correlativo. El código no se reutiliza.',
                step4: 'MEDIR',
                step4p: 'Ensayos instrumentados, con norma o método y fecha. Si no hay ensayo, el campo queda vacío.',
                step5: 'ENSAYAR',
                step5p: 'Ensayos sobre una o más muestras (ML-EXP). Solo se listan experimentos que existen.',
                step6: 'FORMULAR',
                step6p: 'El conocimiento informa la formulación. La formulación no se publica aquí.',
                step7: 'VALIDAR',
                step7p: 'Revisión interna antes de pasar de EN ESTUDIO a DOCUMENTADO.',
                step8: 'DOCUMENTAR',
                step8p: 'Ficha pública con procedencia, revisión y disclaimer. El archivo se actualiza a la vista.',
                chainMineral: 'MINERAL',
                chainAggregate: 'AGREGADO',
                chainFormulation: 'FORMULACIÓN',
                chainMaterial: 'MATERIAL',
                chainSurface: 'SUPERFICIE',
                chainArchitecture: 'ARQUITECTURA',
                catAGG: 'AGREGADOS',
                catBND: 'CEMENTANTES',
                catFIL: 'CARGAS',
                catMIN: 'MINERALES',
                catADM: 'ADITIVOS',
                catPIG: 'PIGMENTOS',
                catFIB: 'FIBRAS',
                catSingularAGG: 'Agregado',
                catSingularBND: 'Cementante',
                catSingularFIL: 'Carga',
                ftBrand: 'MATERIALAB · S-35® · ARCHIVO DE CARACTERIZACIÓN',
                ftFigA: 'FIG. A · REFERENCIA VISUAL',
                ftChemName: 'NOMBRE QUÍMICO',
                ftFamily: 'FAMILIA',
                ftHeadline: 'DATOS DE CABECERA',
                ftParam: 'PARÁMETRO',
                ftTypical: 'VALOR TÍPICO',
                ftPractical: 'EN TÉRMINOS PRÁCTICOS',
                ftNorm: 'NORMA / FUENTE',
                ftOxide: 'ÓXIDO',
                ftRange: 'RANGO %',
                ftId: 'Identificación',
                ftComp: 'Composición',
                ftProps: 'Propiedades y qué significan',
                ftDoc: 'DOCUMENTO TÉCNICO',
                ftOpen: 'ARCHIVO ABIERTO',
                ftAviso: 'AVISO'
            }
        }
    };

    function getStoredLang() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw === 'en' || raw === 'es') return raw;
        const legacy = localStorage.getItem('s35_language_preference');
        if (LEGACY_KEYS[legacy]) return LEGACY_KEYS[legacy];
        return null;
    }

    function t(key, lang) {
        const parts = key.split('.');
        let node = STRINGS[lang];
        for (const p of parts) {
            if (!node) return null;
            node = node[p];
        }
        return typeof node === 'string' ? node : null;
    }

    function applyCards(lang) {
        document.querySelectorAll('.card-item[data-card]').forEach((card) => {
            const id = card.dataset.card;
            const title = t(`cards.${id}.title`, lang);
            const desc = t(`cards.${id}.desc`, lang);
            if (title) {
                card.dataset.title = title;
                const img = card.querySelector('img');
                if (img) img.alt = title;
            }
            if (desc) card.dataset.description = desc;
        });
    }

    function applyMeta(lang) {
        const body = document.body;
        if (!body || !body.dataset) {
            document.documentElement.lang = lang;
            return;
        }
        const page = body.dataset.i18nPage;
        if (page) {
            const title = t(`meta.${page}Title`, lang);
            const desc = t(`meta.${page}Description`, lang);
            if (title) document.title = title;
            if (desc) {
                const meta = document.querySelector('meta[name="description"]');
                if (meta) meta.setAttribute('content', desc);
            }
        }
        if (body.dataset.mlTitleEs) {
            document.title = lang === 'en'
                ? (body.dataset.mlTitleEn || body.dataset.mlTitleEs)
                : body.dataset.mlTitleEs;
        }
        if (body.dataset.mlDescEs) {
            const meta = document.querySelector('meta[name="description"]');
            const text = lang === 'en'
                ? (body.dataset.mlDescEn || body.dataset.mlDescEs)
                : body.dataset.mlDescEs;
            if (meta && text) meta.setAttribute('content', text);
        }
        document.documentElement.lang = lang;
    }

    function applyLangNodes(lang) {
        document.querySelectorAll('[data-ml-lang]').forEach((el) => {
            el.hidden = el.getAttribute('data-ml-lang') !== lang;
        });
    }

    function applyTranslations(lang) {
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            const value = t(key, lang);
            if (!value) return;
            if (el.hasAttribute('data-i18n-html')) {
                el.innerHTML = value;
            } else {
                el.textContent = value;
            }
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
            const key = el.getAttribute('data-i18n-placeholder');
            const value = t(key, lang);
            if (value) el.placeholder = value;
        });
        document.querySelectorAll('[data-i18n-category]').forEach((el) => {
            const cat = el.getAttribute('data-i18n-category');
            const value = t(`catalog.categories.${cat}`, lang);
            if (value) el.textContent = value;
        });
        applyCards(lang);
        applyLangNodes(lang);
        applyMeta(lang);
        document.dispatchEvent(new CustomEvent('s35:languagechange', { detail: { lang } }));
    }

    function setLanguage(lang, persist = true) {
        if (lang !== 'en' && lang !== 'es') return;
        if (persist) {
            localStorage.setItem(STORAGE_KEY, lang);
        }
        document.querySelectorAll('.lang-btn').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
            btn.setAttribute('aria-pressed', btn.dataset.lang === lang ? 'true' : 'false');
        });
        applyTranslations(lang);
    }

    function getLanguage() {
        return getStoredLang() || 'es';
    }

    function injectLangSwitcher() {
        const menu = document.querySelector('.nav-menu');
        if (!menu || document.getElementById('langSwitcher')) return;
        const wrap = document.createElement('div');
        wrap.className = 'lang-switcher';
        wrap.id = 'langSwitcher';
        wrap.setAttribute('role', 'group');
        wrap.setAttribute('aria-label', 'Language');
        wrap.innerHTML = `
            <button type="button" class="lang-btn" data-lang="en" aria-pressed="false">EN</button>
            <button type="button" class="lang-btn" data-lang="es" aria-pressed="false">ES</button>
        `;
        menu.insertBefore(wrap, menu.firstChild);
        wrap.querySelectorAll('.lang-btn').forEach((btn) => {
            btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
        });
    }

    function init() {
        injectLangSwitcher();
        setLanguage(getLanguage(), false);
    }

    global.S35_I18N = { t, setLanguage, getLanguage, STRINGS };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);
