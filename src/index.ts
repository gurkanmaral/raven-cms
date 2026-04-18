export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: unknown }) {
    const s = strapi as unknown as {
      documents: (uid: string) => {
        findMany: (params: Record<string, unknown>) => Promise<unknown[]>
        create: (params: {
          status?: string
          data: Record<string, unknown>
        }) => Promise<unknown>
      }
    }

    const desiredTags = [
      { name: 'Dynamic Cooling', slug: 'dynamic-cooling' },
      { name: 'Humidity Control', slug: 'humidity-control' },
      { name: 'Energy Saving', slug: 'energy-saving' },
      { name: 'Remote Monitoring', slug: 'remote-monitoring' },
      { name: 'Heat Recovery', slug: 'heat-recovery' },
      { name: 'Low Noise', slug: 'low-noise' },
      { name: 'PLC Automation', slug: 'plc-automation' },
      { name: 'Industrial Grade', slug: 'industrial-grade' },
      { name: 'Fast Installation', slug: 'fast-installation' },
    ]

    const byName = new Map<string, string>()

    const hydrateTags = (rows: unknown[]) => {
      for (const t of rows) {
        if (typeof t !== 'object' || t === null) continue
        const record = t as Record<string, unknown>
        const name = record['name']
        const documentId = record['documentId']
        if (typeof name === 'string' && typeof documentId === 'string') {
          byName.set(name, documentId)
        }
      }
    }

    const existingTags = await s.documents('api::tag.tag').findMany({ limit: 500 })
    if (Array.isArray(existingTags)) {
      hydrateTags(existingTags)
    }

    for (const t of desiredTags) {
      if (byName.has(t.name)) continue
      try {
        const created = await s.documents('api::tag.tag').create({
          status: 'published',
          data: { name: t.name, slug: t.slug },
        })
        hydrateTags([created])
      } catch {
        const refreshed = await s.documents('api::tag.tag').findMany({ limit: 500 })
        if (Array.isArray(refreshed)) hydrateTags(refreshed)
      }
    }

    const desiredProducts = [
      {
        title: 'RG Chiller 1200',
        slug: 'rg-chiller-1200',
        shortDescription: 'Yüksek verim, sessiz çalışma ve modüler kontrol mimarisi.',
        category: 'Chiller Sistemleri',
        featured: true,
        sortOrder: 1,
        tags: ['Dynamic Cooling', 'Energy Saving', 'Low Noise'],
      },
      {
        title: 'RG Chiller Compact 480',
        slug: 'rg-chiller-compact-480',
        shortDescription: 'Kompakt tasarım, hızlı kurulum ve yüksek performans.',
        category: 'Chiller Sistemleri',
        featured: false,
        sortOrder: 2,
        tags: ['Fast Installation', 'Industrial Grade'],
      },
      {
        title: 'RG HVAC Pro',
        slug: 'rg-hvac-pro',
        shortDescription: 'Isı geri kazanım, zonlama ve otomasyon entegrasyonu.',
        category: 'HVAC Çözümleri',
        featured: false,
        sortOrder: 1,
        tags: ['Energy Saving', 'Remote Monitoring', 'Heat Recovery'],
      },
      {
        title: 'RG AHU Control',
        slug: 'rg-ahu-control',
        shortDescription: 'Hava işleme üniteleri için akıllı kontrol ve izleme.',
        category: 'HVAC Çözümleri',
        featured: true,
        sortOrder: 2,
        tags: ['PLC Automation', 'Remote Monitoring'],
      },
      {
        title: 'Nem Kontrol Ünitesi',
        slug: 'nem-kontrol-unitesi',
        shortDescription: 'Hassas nem kontrolü, sensör geri bildirimi ve raporlama.',
        category: 'Özel Projeler',
        featured: false,
        sortOrder: 1,
        tags: ['Humidity Control', 'Remote Monitoring'],
      },
      {
        title: 'Proses Soğutma Skidi',
        slug: 'proses-sogutma-skidi',
        shortDescription: 'Özel ihtiyaçlara göre tasarlanmış proses soğutma skidi.',
        category: 'Özel Projeler',
        featured: false,
        sortOrder: 2,
        tags: ['Industrial Grade', 'PLC Automation', 'Dynamic Cooling'],
      },
    ]

    const existingProducts = await s
      .documents('api::product.product')
      .findMany({ limit: 500 })

    const existingSlugs = new Set<string>()
    if (Array.isArray(existingProducts)) {
      for (const p of existingProducts) {
        if (typeof p !== 'object' || p === null) continue
        const record = p as Record<string, unknown>
        const slug = record['slug']
        if (typeof slug === 'string') existingSlugs.add(slug)
      }
    }

    for (const p of desiredProducts) {
      if (existingSlugs.has(p.slug)) continue

      const connect = p.tags
        .map((name) => byName.get(name))
        .filter((id): id is string => typeof id === 'string')

      try {
        await s.documents('api::product.product').create({
          status: 'published',
          data: {
            title: p.title,
            slug: p.slug,
            shortDescription: p.shortDescription,
            category: p.category,
            featured: p.featured,
            sortOrder: p.sortOrder,
            tags: connect.length ? { connect } : undefined,
          },
        })
      } catch {
        continue
      }
    }
  },
};
