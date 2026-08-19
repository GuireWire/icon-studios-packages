// Inlined as SVG rather than imported image files (the original
// bookings-icon-studios components import from that app's own /public
// directory, e.g. "@/public/google.svg" — a package can't assume any
// consuming app ships those exact files at those exact paths). Google and
// Apple are the exact paths from bookings-icon-studios's public/google.svg
// and public/apple.svg. Facebook's original asset was a base64-embedded
// raster PNG wrapped in SVG (bloats a package for no reason); replaced with
// the standard vector Facebook "f" glyph instead, same visual result.

export function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 256 262"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid"
      {...props}
    >
      <path
        d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
        fill="#4285F4"
      />
      <path
        d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
        fill="#34A853"
      />
      <path
        d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
        fill="#FBBC05"
      />
      <path
        d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
        fill="#EB4335"
      />
    </svg>
  );
}

export function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 30 30"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      {...props}
    >
      <path d="M25.565,9.785c-0.123,0.077-3.051,1.702-3.051,5.305c0.138,4.109,3.695,5.55,3.756,5.55 c-0.061,0.077-0.537,1.963-1.947,3.94C23.204,26.283,21.962,28,20.076,28c-1.794,0-2.438-1.135-4.508-1.135 c-2.223,0-2.852,1.135-4.554,1.135c-1.886,0-3.22-1.809-4.4-3.496c-1.533-2.208-2.836-5.673-2.882-9 c-0.031-1.763,0.307-3.496,1.165-4.968c1.211-2.055,3.373-3.45,5.734-3.496c1.809-0.061,3.419,1.242,4.523,1.242 c1.058,0,3.036-1.242,5.274-1.242C21.394,7.041,23.97,7.332,25.565,9.785z M15.001,6.688c-0.322-1.61,0.567-3.22,1.395-4.247 c1.058-1.242,2.729-2.085,4.17-2.085c0.092,1.61-0.491,3.189-1.533,4.339C18.098,5.937,16.488,6.872,15.001,6.688z" />
    </svg>
  );
}

export function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 256 256"
      xmlns="http://www.w3.org/2000/svg"
      fill="#0866FF"
      {...props}
    >
      <path d="M256,128C256,57.308,198.692,0,128,0S0,57.308,0,128c0,63.888,46.808,116.843,108,126.445V165H75.5v-37H108V99.8 c0-32.08,19.11-49.8,48.348-49.8C170.352,50,185,52.5,185,52.5V84h-16.14C152.958,84,148,93.867,148,103.99V128h35.5l-5.675,37 H148v89.445C209.192,244.843,256,191.888,256,128z" />
    </svg>
  );
}
