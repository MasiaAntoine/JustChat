import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

type Slide = { src: string };

type Props = {
  open: boolean;
  onClose: () => void;
  slides: Slide[];
  index?: number;
};

const ImageLightbox = ({ open, onClose, slides, index = 0 }: Props) => (
  <Lightbox
    open={open}
    close={onClose}
    slides={slides}
    index={index}
    plugins={[Zoom]}
    zoom={{
      scrollToZoom: true,
    }}
  />
);

export default ImageLightbox;
