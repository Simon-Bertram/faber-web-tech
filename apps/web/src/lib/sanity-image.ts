import {
  createImageUrlBuilder,
  type SanityImageSource,
} from "@sanity/image-url";
import { sanityClient } from "sanity:client";

const builder = createImageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

const HERO_WIDTHS = [768, 1280, 1920, 2560] as const;

export function heroSrcSet(source: SanityImageSource): string {
  return HERO_WIDTHS.map(
    (width) =>
      `${urlFor(source).width(width).auto("format").fit("max").url()} ${width}w`
  ).join(", ");
}

export function heroSrc(source: SanityImageSource, width = 1920): string {
  return urlFor(source).width(width).auto("format").fit("max").url();
}
