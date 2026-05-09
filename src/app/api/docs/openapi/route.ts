// src/app/api/docs/openapi/route.ts
import { NextResponse } from "next/server";

const spec = {
  openapi: "3.0.3",
  info: {
    title: "Tailorent API",
    version: "1.0.0",
    description:
      "REST API pro platformu Tailorent — objednávání krejčovských služeb s návštěvou u zákazníka.",
    contact: { name: "Tailorent", email: "admin@tailorent.cz" },
  },
  servers: [{ url: "/api", description: "Aktuální server" }],
  tags: [
    { name: "Auth",     description: "Registrace a přihlášení" },
    { name: "Orders",   description: "Objednávky" },
    { name: "Tailors",  description: "Krejčí" },
    { name: "Services", description: "Katalog služeb" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "next-auth.session-token",
        description: "Session cookie nastavená po přihlášení přes NextAuth",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "string", example: "Nepřihlášen" },
        },
      },
      User: {
        type: "object",
        properties: {
          id:    { type: "string", format: "uuid" },
          name:  { type: "string", example: "Jan Novák" },
          email: { type: "string", format: "email", example: "jan@example.cz" },
          role:  { type: "string", enum: ["CUSTOMER", "TAILOR", "ADMIN"] },
        },
      },
      TailorProfile: {
        type: "object",
        properties: {
          id:              { type: "string", format: "uuid" },
          locality:        { type: "string", example: "Praha" },
          bio:             { type: "string", nullable: true },
          specializations: {
            type: "array",
            items: { type: "string", enum: ["ALTERATION", "CUSTOM_SEWING", "EXPRESS"] },
          },
          isAvailable: { type: "boolean" },
          rating:      { type: "number", example: 4.8 },
          reviewCount: { type: "integer", example: 42 },
          user:        { $ref: "#/components/schemas/User" },
        },
      },
      Order: {
        type: "object",
        properties: {
          id:          { type: "string", format: "uuid" },
          serviceType: { type: "string", enum: ["ALTERATION", "CUSTOM_SEWING", "EXPRESS"] },
          description: { type: "string", nullable: true },
          address:     { type: "string", example: "Václavské náměstí 1" },
          city:        { type: "string", example: "Praha" },
          scheduledAt: { type: "string", format: "date-time" },
          status: {
            type: "string",
            enum: ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
          },
          price:      { type: "number", nullable: true, example: 500 },
          notes:      { type: "string", nullable: true },
          customerId: { type: "string", format: "uuid" },
          tailorId:   { type: "string", format: "uuid", nullable: true },
          createdAt:  { type: "string", format: "date-time" },
        },
      },
      Service: {
        type: "object",
        properties: {
          id:            { type: "string", format: "uuid" },
          name:          { type: "string", example: "Úprava oblečení" },
          description:   { type: "string", nullable: true },
          icon:          { type: "string", example: "✂" },
          basePrice:     { type: "number", example: 200 },
          isActive:      { type: "boolean" },
          showOnHomepage:{ type: "boolean" },
          typeKey: {
            type: "string",
            enum: ["ALTERATION", "CUSTOM_SEWING", "EXPRESS"],
            nullable: true,
          },
        },
      },
    },
  },
  paths: {
    // ── AUTH ────────────────────────────────────────────────────────
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Registrace nového zákazníka",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name:     { type: "string", example: "Jan Novák" },
                  email:    { type: "string", format: "email", example: "jan@example.cz" },
                  password: { type: "string", minLength: 8, example: "heslo1234" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Účet vytvořen",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/User" } },
                },
              },
            },
          },
          400: { description: "Neplatná data", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          409: { description: "E-mail již existuje", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ── ORDERS ──────────────────────────────────────────────────────
    "/orders": {
      get: {
        tags: ["Orders"],
        summary: "Seznam objednávek",
        description:
          "Admin vidí všechny objednávky. Krejčí vidí jen přiřazené. Zákazník vidí jen vlastní.",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/Order" } },
                  },
                },
              },
            },
          },
          401: { description: "Nepřihlášen" },
        },
      },
      post: {
        tags: ["Orders"],
        summary: "Vytvořit objednávku",
        description: "Dostupné pro přihlášeného zákazníka.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["serviceType", "address", "city", "scheduledAt"],
                properties: {
                  serviceType: { type: "string", enum: ["ALTERATION", "CUSTOM_SEWING", "EXPRESS"] },
                  description: { type: "string", example: "Zkrátit kalhoty o 5 cm" },
                  address:     { type: "string", example: "Václavské náměstí 1" },
                  city:        { type: "string", example: "Praha" },
                  scheduledAt: { type: "string", format: "date-time" },
                  tailorId:    { type: "string", format: "uuid", description: "Volitelný konkrétní krejčí" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Objednávka vytvořena", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Order" } } } } } },
          400: { description: "Neplatná data" },
          401: { description: "Nepřihlášen" },
        },
      },
    },
    "/orders/{id}": {
      get: {
        tags: ["Orders"],
        summary: "Detail objednávky",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "OK", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Order" } } } } } },
          401: { description: "Nepřihlášen" },
          403: { description: "Přístup zamítnut" },
          404: { description: "Nenalezeno" },
        },
      },
      put: {
        tags: ["Orders"],
        summary: "Aktualizovat objednávku",
        description:
          "Admin: libovolná pole. Krejčí: pouze `status` (CONFIRMED→IN_PROGRESS→COMPLETED). Zákazník: pouze `status: CANCELLED`.",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status:   { type: "string", enum: ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] },
                  tailorId: { type: "string", format: "uuid", nullable: true },
                  price:    { type: "number", minimum: 0, example: 500 },
                  notes:    { type: "string", example: "Interní poznámka" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Aktualizováno" },
          400: { description: "Neplatná data / nepovolen přechod stavu" },
          401: { description: "Nepřihlášen" },
          403: { description: "Přístup zamítnut" },
        },
      },
      delete: {
        tags: ["Orders"],
        summary: "Zrušit objednávku",
        description: "Zákazník může zrušit vlastní objednávku ve stavu PENDING nebo CONFIRMED. Admin může zrušit libovolnou.",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Objednávka zrušena" },
          400: { description: "Nelze zrušit v aktuálním stavu" },
          401: { description: "Nepřihlášen" },
          403: { description: "Přístup zamítnut" },
        },
      },
    },

    // ── TAILORS ─────────────────────────────────────────────────────
    "/tailors": {
      get: {
        tags: ["Tailors"],
        summary: "Seznam krejčích",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/TailorProfile" } },
                  },
                },
              },
            },
          },
          401: { description: "Nepřihlášen" },
        },
      },
      post: {
        tags: ["Tailors"],
        summary: "Vytvořit krejčího",
        description: "Pouze admin.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password", "locality", "specializations"],
                properties: {
                  name:            { type: "string", example: "Jana Nováková" },
                  email:           { type: "string", format: "email" },
                  password:        { type: "string", minLength: 8 },
                  locality:        { type: "string", example: "Praha" },
                  specializations: { type: "array", items: { type: "string", enum: ["ALTERATION", "CUSTOM_SEWING", "EXPRESS"] } },
                  bio:             { type: "string" },
                  isAvailable:     { type: "boolean", default: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Krejčí vytvořen" },
          400: { description: "Neplatná data" },
          403: { description: "Přístup zamítnut" },
          409: { description: "E-mail již existuje" },
        },
      },
    },
    "/tailors/{id}": {
      get: {
        tags: ["Tailors"],
        summary: "Detail krejčího",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "OK", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/TailorProfile" } } } } } },
          401: { description: "Nepřihlášen" },
          404: { description: "Nenalezen" },
        },
      },
      put: {
        tags: ["Tailors"],
        summary: "Upravit krejčího",
        description: "Pouze admin.",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name:            { type: "string" },
                  locality:        { type: "string" },
                  specializations: { type: "array", items: { type: "string", enum: ["ALTERATION", "CUSTOM_SEWING", "EXPRESS"] } },
                  bio:             { type: "string" },
                  isAvailable:     { type: "boolean" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Aktualizováno" },
          403: { description: "Přístup zamítnut" },
          404: { description: "Nenalezen" },
        },
      },
      delete: {
        tags: ["Tailors"],
        summary: "Smazat krejčího",
        description: "Pouze admin. Kaskádově smaže profil, objednávky dostanou tailorId=null.",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Smazán" },
          403: { description: "Přístup zamítnut" },
          404: { description: "Nenalezen" },
        },
      },
    },

    // ── SERVICES ────────────────────────────────────────────────────
    "/services": {
      get: {
        tags: ["Services"],
        summary: "Seznam všech služeb",
        description: "Veřejný endpoint — nevyžaduje přihlášení.",
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/Service" } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Services"],
        summary: "Vytvořit službu",
        description: "Pouze admin. Na homepage lze zobrazit nejvýše 3 služby.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "basePrice"],
                properties: {
                  name:           { type: "string", example: "Úprava oblečení" },
                  description:    { type: "string" },
                  icon:           { type: "string", example: "✂" },
                  basePrice:      { type: "number", minimum: 0, example: 200 },
                  isActive:       { type: "boolean", default: true },
                  showOnHomepage: { type: "boolean", default: false },
                  typeKey:        { type: "string", enum: ["ALTERATION", "CUSTOM_SEWING", "EXPRESS"], nullable: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Služba vytvořena" },
          403: { description: "Přístup zamítnut" },
          422: { description: "Na homepage jsou již 3 služby" },
        },
      },
    },
    "/services/{id}": {
      put: {
        tags: ["Services"],
        summary: "Upravit službu",
        description: "Pouze admin.",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name:           { type: "string" },
                  description:    { type: "string" },
                  icon:           { type: "string" },
                  basePrice:      { type: "number", minimum: 0 },
                  isActive:       { type: "boolean" },
                  showOnHomepage: { type: "boolean" },
                  typeKey:        { type: "string", enum: ["ALTERATION", "CUSTOM_SEWING", "EXPRESS"], nullable: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Aktualizováno" },
          403: { description: "Přístup zamítnut" },
          422: { description: "Na homepage jsou již 3 služby" },
        },
      },
      delete: {
        tags: ["Services"],
        summary: "Smazat službu",
        description: "Pouze admin.",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Smazána" },
          403: { description: "Přístup zamítnut" },
        },
      },
    },
  },
};

export function GET() {
  return NextResponse.json(spec);
}
