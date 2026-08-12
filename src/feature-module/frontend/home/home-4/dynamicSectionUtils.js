import { getImageUrl } from "../../../../utils";

export const normalizeItem = (item) => {
  const DiscusedPrice = item?.price || 0;
  const productDetails = item?.productDetails || {};
  const businessDetails = productDetails?.businessDetails || {};
  const vendorDetails = productDetails?.vendor || {};

  const firstVendor =
    item.vendordetails ||
    (item.vendors && item.vendors[0]) ||
    item.vendor ||
    null;

  const newApiVendor = {
    vendorId: vendorDetails._id || vendorDetails.id,
    name:
      businessDetails.name ||
      (vendorDetails.firstName && vendorDetails.lastName
        ? `${vendorDetails.firstName} ${vendorDetails.lastName}`
        : "") ||
      "",
    price: productDetails.price || 0,
    discountprice: productDetails.discountprice || null,
    discountType: productDetails.discountType || null,
    stock: productDetails.stock || 0,
    bussiness_image: businessDetails.bussiness_image || null,
    bussinessdetails: {
      name: businessDetails.name || "",
      bussiness_image: businessDetails.bussiness_image || null,
    },
  };

  const finalVendor = productDetails.price
    ? newApiVendor
    : firstVendor
      ? {
        ...firstVendor,
        vendorId:
          firstVendor.vendorId || firstVendor._id || firstVendor.id,
        name:
          firstVendor.name ||
          firstVendor.vendorName ||
          firstVendor?.bussinessdetails?.name ||
          item?.brand?.name ||
          "",
        price:
          firstVendor.price ||
          firstVendor.matchedVariantPrice ||
          firstVendor.matchedPrice ||
          firstVendor.mrp ||
          firstVendor.sellingPrice ||
          DiscusedPrice ||
          0,
      }
      : {
        name: item?.brand?.name || "",
        price: DiscusedPrice,
        bookingType: "cart",
      };

  return {
    ...item,
    tabletdetails: item,
    vendordetails: finalVendor,
    variants: productDetails.variants || {
      _id: item._id,
      name: item.name,
      files:
        (item.files?.length > 0 ? item.files : null) ||
        (item.imageUrl?.length > 0 ? item.imageUrl : null) ||
        item.tabletvariants?.[0]?.files ||
        [],
      price: finalVendor.price || DiscusedPrice,
      discountPrice:
        productDetails.discountprice || item.discountPrice || null,
      stock: productDetails.stock || 999,
      isStock: true,
    },

    vendors: [],
  };
};

export const buildImageSrc = (candidate, imgUrl) => {
  const placeholder = "https://placehold.co";

  if (!candidate) return null;

  // 1. Array handling: Iterate through and look for the first valid resolved image string
  if (Array.isArray(candidate)) {
    for (const entry of candidate) {
      const resolved = buildImageSrc(entry, imgUrl);
      if (resolved && resolved !== placeholder) {
        return resolved;
      }
    }
    return null;
  }

  // 2. Object handling: Inspect ONLY real image-related subkeys
  if (typeof candidate === "object") {
    const nestedCandidate =
      candidate?.url ||
      candidate?.path ||
      candidate?.file ||
      candidate?.src ||
      candidate?.image ||
      candidate?.imageUrl ||
      candidate?.filePath ||
      candidate?.fileName ||
      "";

    if (Array.isArray(nestedCandidate) || typeof nestedCandidate === "object") {
      return buildImageSrc(nestedCandidate, imgUrl);
    }

    return nestedCandidate ? buildImageSrc(nestedCandidate, imgUrl) : null;
  }

  // 3. String verification: Ensure candidate isn't junk data or an extension-less product name
  const value = String(candidate).trim();
  if (!value || value === "null" || value === "undefined" || value === "[object Object]") {
    return null;
  }

  // Ignore plain descriptive titles or numeric strings that are falsely caught as paths
  if (!isNaN(value) || (value.length > 5 && !value.includes("/") && !value.includes("."))) {
    return null;
  }

  // Use your helper function if it exists
  if (typeof getImageUrl === "function") {
    const resolvedByHelper = getImageUrl(value);
    if (resolvedByHelper) return resolvedByHelper;
  }

  // Return immediately if it's already an absolute full URL track
  if (/^https?:\/\//i.test(value)) return value;

  // Cleanly stitch relative paths with your base API string
  const normalizedBase =
    typeof imgUrl === "string" && imgUrl
      ? imgUrl.endsWith("/")
        ? imgUrl
        : `${imgUrl}/`
      : "";

  const normalizedPath = value.replace(/^\/+/, "");
  return normalizedBase ? `${normalizedBase}${normalizedPath}` : normalizedPath;
};
