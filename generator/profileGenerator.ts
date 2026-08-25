import { Profile, PROFILES, getProfileById } from "./profiles";
import { renderHeader, renderFooter } from "./htmlTemplates";

export function generateProfileLinkset(profile: Profile, baseUrl: string) {
  const profileUri = `${baseUrl}/id/profile/${profile.id}`;
  const items: any[] = [];

  if (profile.composedProfiles) {
    for (const subId of profile.composedProfiles) {
      const subProfile = getProfileById(subId);
      const targetUri = `${baseUrl}/id/profile/${subId}`;
      items.push({
        href: targetUri,
        title: subProfile ? subProfile.title : subId
      });
    }
  }

  const primaryObj: any = {
    anchor: profileUri,
    type: [
      { href: "http://www.w3.org/ns/dx/prof/Profile", title: "W3C Profiles Vocabulary" }
    ],
    alternate: [
      { href: `${baseUrl}/id/profile/${profile.id}.ttl`, type: "text/turtle; charset=utf-8" },
      { href: `${baseUrl}/id/profile/${profile.id}.jsonld`, type: "application/ld+json" },
      { href: `${baseUrl}/id/profile/${profile.id}.html`, type: "text/html; charset=utf-8" }
    ]
  };

  if (items.length > 0) {
    primaryObj["http://schema.org/hasPart"] = items;
  }

  return {
    linkset: [
      primaryObj,
      {
        anchor: `${baseUrl}/id/profile/${profile.id}.ttl`,
        self: [{ href: profileUri }]
      },
      {
        anchor: `${baseUrl}/id/profile/${profile.id}.jsonld`,
        self: [{ href: profileUri }]
      },
      {
        anchor: `${baseUrl}/id/profile/${profile.id}.html`,
        self: [{ href: profileUri }]
      }
    ]
  };
}

export function generateProfileTurtle(profile: Profile, baseUrl: string): string {
  const profileUri = `${baseUrl}/id/profile/${profile.id}`;
  let ttl = `@prefix prof: <http://www.w3.org/ns/dx/prof/> .\n`;
  ttl += `@prefix dcterms: <http://purl.org/dc/terms/> .\n`;
  ttl += `@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n`;
  ttl += `@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n\n`;

  ttl += `<${profileUri}> a prof:Profile ;\n`;
  ttl += `    rdfs:label "${profile.title}" ;\n`;
  ttl += `    dcterms:title "${profile.title}" ;\n`;
  ttl += `    dcterms:description "${profile.description.replace(/"/g, '\\"')}" ;\n`;
  ttl += `    dcterms:publisher "${profile.publisher}" ;\n`;
  ttl += `    prof:isProfileOf <${profile.conformsToStandard}> ;\n`;

  if (profile.composedProfiles && profile.composedProfiles.length > 0) {
    const subUris = profile.composedProfiles.map(s => `<${baseUrl}/id/profile/${s}>`).join(",\n        ");
    ttl += `    dcterms:hasPart ${subUris} ;\n`;
  }

  ttl += `    prof:hasResource [\n`;
  ttl += `        a prof:ResourceDescriptor ;\n`;
  ttl += `        rdfs:label "SHACL Validation Shape" ;\n`;
  ttl += `        prof:hasRole <http://www.w3.org/ns/dx/prof/role/validation> ;\n`;
  ttl += `        prof:hasArtifact <${baseUrl}/id/profile/${profile.id}.ttl> ;\n`;
  ttl += `        dcterms:format "text/turtle"\n`;
  ttl += `    ] .\n\n`;

  ttl += `# --- SHACL Validation Shape ---\n`;
  ttl += profile.shaclShape;

  return ttl;
}

export function generateProfileJsonLd(profile: Profile, baseUrl: string): string {
  const profileUri = `${baseUrl}/id/profile/${profile.id}`;
  const jsonld: any = {
    "@context": {
      "prof": "http://www.w3.org/ns/dx/prof/",
      "dcterms": "http://purl.org/dc/terms/",
      "rdfs": "http://www.w3.org/2000/01/rdf-schema#"
    },
    "@id": profileUri,
    "@type": "prof:Profile",
    "rdfs:label": profile.title,
    "dcterms:title": profile.title,
    "dcterms:description": profile.description,
    "dcterms:publisher": profile.publisher,
    "prof:isProfileOf": { "@id": profile.conformsToStandard }
  };

  if (profile.composedProfiles && profile.composedProfiles.length > 0) {
    jsonld["dcterms:hasPart"] = profile.composedProfiles.map(s => ({
      "@id": `${baseUrl}/id/profile/${s}`
    }));
  }

  return JSON.stringify(jsonld, null, 2);
}

export function generateProfileHtml(profile: Profile, baseUrl: string): string {
  const composedHtml = profile.composedProfiles && profile.composedProfiles.length > 0
    ? `
      <div class="meta-section" style="margin-top: 1.5rem;">
        <h3 style="font-size: 1.15rem; color: var(--vliz-blue);"><i class="fa-solid fa-layer-group" style="color: var(--marine-teal);"></i> Composed Sub-Profiles (RT-P02 via rel="item"):</h3>
        <p style="font-size: 0.95rem; color: var(--text-secondary);">This composite profile aggregates and guarantees conformance to the following constituent standards:</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; margin-top: 1rem;">
          ${profile.composedProfiles.map(subId => {
            const sub = getProfileById(subId);
            return `
              <div style="background: var(--bg-subtle); border: 1px solid var(--panel-border); border-radius: var(--radius-md); padding: 1rem;">
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--marine-teal); text-transform: uppercase;">ATOMIC PROFILE</div>
                <h4 style="margin: 0.3rem 0 0.5rem; font-size: 1rem;"><a href="/id/profile/${subId}.html" style="color: var(--text-primary); text-decoration: none;">${sub ? sub.title : subId}</a></h4>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">${sub ? sub.description : ''}</p>
                <div style="margin-top: 0.75rem;"><a href="/id/profile/${subId}.html" class="btn-download" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">View Sub-Profile &rarr;</a></div>
              </div>
            `;
          }).join("\n")}
        </div>
      </div>
    `
    : `
      <div class="meta-section" style="margin-top: 1.5rem;">
        <span class="hero-tag" style="background: #f0fdf4; color: #16a34a; border-color: #bbf7d0;">Atomic Specification Profile</span>
        <p style="font-size: 0.95rem; color: var(--text-secondary); margin-top: 0.5rem;">This is an atomic baseline specification profile defining core structural constraints.</p>
      </div>
    `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${profile.title} - Semantic Profile - VLIZ</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="describedby" type="text/turtle" href="/id/profile/${profile.id}.ttl">
  <link rel="describedby" type="application/ld+json" href="/id/profile/${profile.id}.jsonld">
  <link rel="linkset" type="application/linkset+json" href="/id/profile/${profile.id}.linkset.json">
</head>
<body>
  ${renderHeader('profiles')}

  <div class="detail-header">
    <div class="detail-header-inner">
      <span class="hero-tag">${profile.isAtomic ? 'Atomic Profile' : 'Composite Profile (RT-P02)'}</span>
      <h2 class="detail-title">📑 ${profile.title}</h2>
      <p style="font-size: 1.05rem; color: var(--text-secondary); margin: 0.5rem 0 0; max-width: 900px;">
        ${profile.description}
      </p>
    </div>
  </div>

  <main class="page-container" style="max-width: 1200px; margin: 2rem auto; padding: 0 1.5rem;">
    <!-- Profile Card -->
    <div style="background: var(--panel-bg); border: 1px solid var(--panel-border); border-radius: var(--radius-lg); padding: 2rem; box-shadow: var(--shadow-md);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--panel-border); padding-bottom: 1rem;">
        <div>
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
            Profile URI
            <span style="font-size: 0.75rem; background: #dcfce7; color: #166534; padding: 0.15rem 0.5rem; border-radius: 9999px; font-weight: 600; margin-left: 0.4rem; text-transform: none;"><i class="fa-solid fa-circle-check"></i> Local Canonical Endpoint</span>
          </div>
          <code style="font-size: 0.95rem; color: var(--vliz-blue); background: var(--bg-subtle); padding: 0.2rem 0.5rem; border-radius: var(--radius-sm); margin-top: 0.35rem; display: inline-block;">${baseUrl}/id/profile/${profile.id}.html</code>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <a href="/id/profile/${profile.id}.ttl" class="btn-download" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;"><i class="fa-solid fa-file-code"></i> Turtle RDF</a>
          <a href="/id/profile/${profile.id}.linkset.json" class="btn-download" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;"><i class="fa-solid fa-link"></i> RFC 9264 Linkset</a>
        </div>
      </div>

      <div style="margin-top: 1.5rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;">
        <div>
          <strong style="color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase;">Publisher:</strong>
          <div style="font-size: 1rem; font-weight: 600; color: var(--text-primary); margin-top: 0.2rem;">${profile.publisher}</div>
        </div>
        <div>
          <strong style="color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase;">Conforms To Standard:</strong>
          <div style="font-size: 0.95rem; margin-top: 0.2rem;"><a href="${profile.conformsToStandard}" target="_blank" style="color: var(--vliz-blue); font-weight: 600;">${profile.conformsToStandard}</a></div>
          ${!profile.isAtomic ? `<div style="margin-top: 0.35rem;"><a href="${profile.specUrl}" target="_blank" style="color: var(--marine-teal); font-size: 0.85rem; font-weight: 600;"><i class="fa-solid fa-arrow-up-right-from-square"></i> EOSC RT-P02 (Profile Composition) Spec &rarr;</a></div>` : ''}
        </div>
      </div>

      ${composedHtml}

      <!-- SHACL Shape Definition -->
      <div style="margin-top: 2rem;">
        <h3 style="font-size: 1.15rem; color: var(--vliz-blue);"><i class="fa-solid fa-shield-halved" style="color: var(--marine-teal);"></i> W3C SHACL Validation Shape</h3>
        <pre style="background: #0f172a; color: #f8fafc; padding: 1.25rem; border-radius: var(--radius-md); overflow-x: auto; font-size: 0.85rem; line-height: 1.5; margin-top: 0.75rem;"><code>${profile.shaclShape}</code></pre>
      </div>
    </div>
  </main>

  ${renderFooter()}
</body>
</html>`;
}

export function generateProfileCatalogHtml(profiles: Profile[], baseUrl: string): string {
  const composites = profiles.filter(p => !p.isAtomic);
  const atomics = profiles.filter(p => p.isAtomic);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Semantic Profiles Registry & Composition - VLIZ Portal</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  ${renderHeader('profiles')}

  <div class="detail-header">
    <div class="detail-header-inner">
      <span class="hero-tag">Radical Transparency Profiles (RFC 6906 & RT-P02)</span>
      <h2 class="detail-title">📑 Semantic Profiles & Composition Registry</h2>
      <p style="font-size: 1.05rem; color: var(--text-secondary); margin: 0.5rem 0 0; max-width: 900px;">
        Exposing explicit profile declarations (<code style="background: var(--bg-subtle); padding: 0.2rem 0.4rem; border-radius: 4px;">rel="profile"</code>) and recursive profile hierarchies (<code style="background: var(--bg-subtle); padding: 0.2rem 0.4rem; border-radius: 4px;">rel="item"</code>) across all marine linked data resources.
      </p>
    </div>
  </div>

  <main class="page-container" style="max-width: 1300px; margin: 2rem auto; padding: 0 1.5rem;">
    <!-- Composite Profiles Section -->
    <section style="margin-bottom: 3rem;">
      <h3 style="font-size: 1.4rem; color: var(--vliz-blue); margin-bottom: 0.5rem;"><i class="fa-solid fa-layer-group" style="color: var(--marine-teal);"></i> 1. Composite Profiles (RT-P02: Profile Composition)</h3>
      <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Composite profiles aggregate multiple atomic standards into verified contracts for specific marine research entities.</p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 1.5rem;">
        ${composites.map(p => `
          <div style="background: var(--panel-bg); border: 1px solid var(--panel-border); border-radius: var(--radius-lg); padding: 1.75rem; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <span class="hero-tag" style="background: #f0f9ff; color: #0284c7; border-color: #bae6fd;">Composite Profile</span>
              <h4 style="font-size: 1.2rem; margin: 0.6rem 0 0.5rem;"><a href="/id/profile/${p.id}.html" style="color: var(--text-primary); text-decoration: none;">${p.title}</a></h4>
              <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5;">${p.description}</p>
              
              <div style="margin-top: 1rem; background: var(--bg-subtle); padding: 0.8rem; border-radius: var(--radius-sm);">
                <strong style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Composed Standards (${p.composedProfiles?.length || 0}):</strong>
                <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.4rem;">
                  ${p.composedProfiles?.map(c => `<span style="font-size: 0.75rem; background: #ffffff; border: 1px solid var(--panel-border); padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 600; color: var(--vliz-blue);">${c.replace('-profile', '')}</span>`).join('')}
                </div>
              </div>
            </div>

            <div style="margin-top: 1.5rem; display: flex; gap: 0.5rem;">
              <a href="/id/profile/${p.id}.html" class="btn-download" style="flex: 1; text-align: center; padding: 0.5rem;">Explore Profile &rarr;</a>
            </div>
          </div>
        `).join("\n")}
      </div>
    </section>

    <!-- Atomic Base Profiles Section -->
    <section>
      <h3 style="font-size: 1.4rem; color: var(--vliz-blue); margin-bottom: 0.5rem;"><i class="fa-solid fa-atom" style="color: var(--marine-teal);"></i> 2. Atomic Base Profiles</h3>
      <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Underlying domain schemas and open standards referenced by our composite profiles.</p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem;">
        ${atomics.map(p => `
          <div style="background: var(--panel-bg); border: 1px solid var(--panel-border); border-radius: var(--radius-md); padding: 1.25rem; box-shadow: var(--shadow-sm);">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">${p.publisher}</div>
            <h4 style="font-size: 1.05rem; margin: 0.3rem 0 0.5rem;"><a href="/id/profile/${p.id}.html" style="color: var(--text-primary); text-decoration: none;">${p.title}</a></h4>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0 0 1rem;">${p.description}</p>
            <a href="/id/profile/${p.id}.html" class="btn-download" style="padding: 0.35rem 0.7rem; font-size: 0.8rem;">Specification &rarr;</a>
          </div>
        `).join("\n")}
      </div>
    </section>
  </main>

  ${renderFooter()}
</body>
</html>`;
}
