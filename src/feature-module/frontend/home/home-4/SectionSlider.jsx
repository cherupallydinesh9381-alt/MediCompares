import React from "react";

export const NextArrow = (props) => {
  const { style, onClick } = props;
  return (
    <button
      className="meq-arrow-btn dental-next"
      style={{ ...style, display: "block" }}
      onClick={onClick}
      aria-label="Next"
    >
      <i className="fas fa-chevron-right"></i>
    </button>
  );
};

export const PrevArrow = (props) => {
  const { style, onClick } = props;
  return (
    <button
      className="meq-arrow-btn dental-prev"
      style={{ ...style, display: "block" }}
      onClick={onClick}
      aria-label="Previous"
    >
      <i className="fas fa-chevron-left"></i>
    </button>
  );
};

export const getSliderSettings = (itemsCount) => ({
  dots: false,
  infinite: itemsCount > 6,
  speed: 500,
  autoplay: true,
  autoplaySpeed: 3000,
  slidesToShow: 6,
  slidesToScroll: 1,
  nextArrow: <NextArrow />,
  prevArrow: <PrevArrow />,
  responsive: [
    {
      breakpoint: 1200,
      settings: {
        slidesToShow: 4,
        infinite: itemsCount > 4,
      },
    },
    {
      breakpoint: 992,
      settings: {
        slidesToShow: 3,
        infinite: itemsCount > 3,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 2,
        infinite: itemsCount > 2,
      },
    },
    {
      breakpoint: 576,
      settings: {
        slidesToShow: 2,
        infinite: itemsCount > 2,
      },
    },
  ],
});
