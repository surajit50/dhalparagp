import { Template } from "@pdfme/common";

export async function loadJSONTemplate(
  templatePath: string
): Promise<Template> {
  try {
    const response = await fetch(templatePath);
    if (!response.ok) {
      throw new Error(
        `Failed to load template: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    const validationResult = isValidTemplate(data);
    if (!validationResult.isValid) {
      throw new Error(`Invalid template structure: ${validationResult.error}`);
    }
    // Normalize fonts to avoid runtime failures in @pdfme/generator when a custom
    // font name is referenced in the template but not actually registered/available.
    // Your templates frequently use "NotoSansJP-Regular" but no font files are shipped.
    normalizeTemplateFontsInPlace(data);
    return data as Template;
  } catch (error) {
    console.error("Error loading JSON template:", error);
    throw new Error(
      "Failed to load the PDF template. Please check the template structure and try again."
    );
  }
}

function normalizeTemplateFontsInPlace(template: any) {
  // pdf-lib built-in font names (supported by pdfme generator via pdf-lib)
  const allowed = new Set(["Helvetica", "Times-Roman", "Courier"]);
  const fallback = "Helvetica";

  if (!template || typeof template !== "object" || !Array.isArray(template.schemas)) {
    return;
  }

  for (const pageSchemas of template.schemas) {
    if (!Array.isArray(pageSchemas)) continue;
    for (const schema of pageSchemas) {
      if (!schema || typeof schema !== "object") continue;
      if (typeof schema.fontName === "string" && !allowed.has(schema.fontName)) {
        schema.fontName = fallback;
      }
    }
  }
}

function isValidTemplate(data: any): { isValid: boolean; error?: string } {
  if (typeof data !== "object" || data === null) {
    return { isValid: false, error: "Template is not an object" };
  }
  if (
    !Array.isArray(data.schemas) ||
    data.schemas.length === 0 ||
    !Array.isArray(data.schemas[0])
  ) {
    return { isValid: false, error: "Template schemas is not a valid array" };
  }
  if (typeof data.basePdf !== "object" || data.basePdf === null) {
    return { isValid: false, error: "Template basePdf is not an object" };
  }
  if (typeof data.pdfmeVersion !== "string") {
    return { isValid: false, error: "Template pdfmeVersion is not a string" };
  }
  for (let i = 0; i < data.schemas[0].length; i++) {
    const schemaValidation = isValidSchema(data.schemas[0][i], i);
    if (!schemaValidation.isValid) {
      return schemaValidation;
    }
  }
  return { isValid: true };
}

function isValidSchema(
  schema: any,
  index: number
): { isValid: boolean; error?: string } {
  switch (schema.type) {
    case "text":
      return validateTextSchema(schema, index);
    case "qrcode":
      return validateQRCodeSchema(schema, index);
    case "image":
      return validateImageSchema(schema, index);
    case "line":
      return validateLineSchema(schema, index);
    case "table":
      return validateTableSchema(schema, index);
    case "rectangle":
      return validateRectangleSchema(schema, index);
    case "line":
      return validateLineSchema(schema, index);
    case "ellipse":
      return validateEllipseSchema(schema, index);
    default:
      return {
        isValid: false,
        error: `Unknown schema type at index ${index}: ${schema.type}`,
      };
  }
}

function validateTableSchema(schema: any, index: number) {
  if (typeof schema.content !== "string" || !isValidJSONArray(schema.content)) {
    return {
      isValid: false,
      error: `Schema content at index ${index} is not a valid JSON array string for table type`,
    };
  }
  return { isValid: true };
}

function validateTextSchema(schema: any, index: number) {
  if (typeof schema.content !== "string" && typeof schema.text !== "string") {
    return {
      isValid: false,
      error: `Schema content or text at index ${index} is not a string for text or multiVariableText type`,
    };
  }
  return { isValid: true };
}

function validateQRCodeSchema(schema: any, index: number) {
  if (typeof schema.position !== "object" || schema.position === null) {
    return {
      isValid: false,
      error: `Invalid position for qrcode schema at index ${index}`,
    };
  }
  if (typeof schema.width !== "number" || typeof schema.height !== "number") {
    return {
      isValid: false,
      error: `Invalid width or height for qrcode schema at index ${index}`,
    };
  }
  return { isValid: true };
}

function validateImageSchema(schema: any, index: number) {
  if (typeof schema.position !== "object" || schema.position === null) {
    return {
      isValid: false,
      error: `Invalid position for image schema at index ${index}`,
    };
  }
  if (typeof schema.width !== "number" || typeof schema.height !== "number") {
    return {
      isValid: false,
      error: `Invalid width or height for image schema at index ${index}`,
    };
  }
  return { isValid: true };
}

function validateLineSchema(schema: any, index: number) {
  if (typeof schema.position !== "object" || schema.position === null) {
    return {
      isValid: false,
      error: `Invalid position for line schema at index ${index}`,
    };
  }
  if (typeof schema.width !== "number" || schema.width < 0) {
    return {
      isValid: false,
      error: `Invalid width for line schema at index ${index}. Width must be a non-negative number.`,
    };
  }
  if (typeof schema.height !== "number" || schema.height < 0) {
    return {
      isValid: false,
      error: `Invalid height for line schema at index ${index}. Height must be a non-negative number.`,
    };
  }
  if (schema.opacity !== undefined) {
    if (
      typeof schema.opacity !== "number" ||
      schema.opacity < 0 ||
      schema.opacity > 1
    ) {
      return {
        isValid: false,
        error: `Opacity must be between 0 and 1 for line schema at index ${index}`,
      };
    }
  }
  const colorCandidate =
    typeof schema.color === "string"
      ? schema.color
      : typeof schema.borderColor === "string"
      ? schema.borderColor
      : undefined;
  if (colorCandidate !== undefined && !/^#[0-9A-F]{6}$/i.test(colorCandidate)) {
    return {
      isValid: false,
      error: `Invalid color format for line schema at index ${index}: ${colorCandidate}`,
    };
  }
  return { isValid: true };
}

function validateRectangleSchema(schema: any, index: number) {
  if (typeof schema.position !== "object" || schema.position === null) {
    return {
      isValid: false,
      error: `Invalid position for rectangle schema at index ${index}`,
    };
  }
  if (typeof schema.width !== "number" || typeof schema.height !== "number") {
    return {
      isValid: false,
      error: `Invalid width or height for rectangle schema at index ${index}`,
    };
  }
  if (
    typeof schema.borderColor !== "string" ||
    !/^#[0-9A-F]{6}$/i.test(schema.borderColor)
  ) {
    return {
      isValid: false,
      error: `Invalid borderColor format for rectangle schema at index ${index}: ${schema.borderColor}`,
    };
  }
  if (typeof schema.borderWidth !== "number" || schema.borderWidth < 0) {
    return {
      isValid: false,
      error: `Invalid borderWidth for rectangle schema at index ${index}. BorderWidth must be a non-negative number.`,
    };
  }
  if (
    schema.backgroundColor &&
    (typeof schema.backgroundColor !== "string" ||
      !/^#[0-9A-F]{6}$/i.test(schema.backgroundColor))
  ) {
    return {
      isValid: false,
      error: `Invalid backgroundColor format for rectangle schema at index ${index}: ${schema.backgroundColor}`,
    };
  }
  return { isValid: true };
}

function validateEllipseSchema(schema: any, index: number) {
  if (typeof schema.position !== "object" || schema.position === null) {
    return {
      isValid: false,
      error: `Invalid position for ellipse schema at index ${index}`,
    };
  }
  if (typeof schema.width !== "number" || typeof schema.height !== "number") {
    return {
      isValid: false,
      error: `Invalid width or height for ellipse schema at index ${index}`,
    };
  }
  if (
    typeof schema.borderColor !== "string" ||
    !/^#[0-9A-F]{6}$/i.test(schema.borderColor)
  ) {
    return {
      isValid: false,
      error: `Invalid borderColor format for ellipse schema at index ${index}: ${schema.borderColor}`,
    };
  }
  if (typeof schema.borderWidth !== "number" || schema.borderWidth < 0) {
    return {
      isValid: false,
      error: `Invalid borderWidth for ellipse schema at index ${index}. BorderWidth must be a non-negative number.`,
    };
  }
  if (
    schema.backgroundColor &&
    (typeof schema.backgroundColor !== "string" ||
      !/^#[0-9A-F]{6}$/i.test(schema.backgroundColor))
  ) {
    return {
      isValid: false,
      error: `Invalid backgroundColor format for ellipse schema at index ${index}: ${schema.backgroundColor}`,
    };
  }
  return { isValid: true };
}

function isValidJSONArray(str: string): boolean {
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) && parsed.every((row) => Array.isArray(row));
  } catch (error) {
    return false;
  }
}
