import{a,j as e,x as g,d as b}from"./index-CVI3QrFR.js";import{u as j,S as N,a as v}from"./router-CQUQbEfv.js";const w=({triggerShow:i=!1})=>{const[d,l]=a.useState(!1),[t,c]=a.useState(!1);a.useEffect(()=>{const s=parseInt(localStorage.getItem("compareModalViewCount")||"0",10);if(i&&s<2){const o=setTimeout(()=>{l(!0),setTimeout(()=>c(!0),50),localStorage.setItem("compareModalViewCount",(s+1).toString())},500);return()=>clearTimeout(o)}},[i]);const n=()=>{c(!1),setTimeout(()=>{l(!1)},300)};return d?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:`modal fade ${t?"show":""} d-block p-2 p-md-0`,tabIndex:"-1",style:{backgroundColor:"rgba(0, 0, 0, 0.8)",zIndex:999999999,display:"flex",alignItems:"center",opacity:t?1:0,transition:"opacity 0.3s ease-in-out"},children:e.jsx("div",{className:"modal-dialog custom-modal modal-dialog-centered",style:{transform:t?"scale(1)":"scale(0.9)",transition:"transform 0.3s ease-in-out"},children:e.jsxs("div",{className:"modal-content",children:[e.jsx("div",{className:"modal-header",children:e.jsx("button",{type:"button",className:"btn-close",onClick:n})}),e.jsx("div",{className:"modal-body p-0",children:e.jsx("div",{className:"compare-section bg-white",children:e.jsxs("div",{className:"row align-items-center",children:[e.jsxs("div",{className:"col-lg-6 col-12",children:[e.jsx("h5",{className:"fw-bold mb-2",children:"Compare Medicines in Seconds"}),e.jsx("p",{className:"text-muted small mb-4",children:"Find the best price, ratings, and availability instantly."}),e.jsxs("div",{className:"steps-container",children:[e.jsxs("div",{className:"step-wrapper",children:[e.jsx("div",{className:"step-icon icon-purple",children:e.jsx("i",{className:"fa fa-search"})}),e.jsx("h6",{className:"fw-bold mb-0",children:"Search Medicine"}),e.jsx("small",{className:"text-muted",children:"Use search bar to find medicine."})]}),e.jsxs("div",{className:"step-wrapper",children:[e.jsx("div",{className:"step-icon icon-teal",children:e.jsx("i",{className:"fa fa-check"})}),e.jsx("h6",{className:"fw-bold mb-0",children:"Select Products"}),e.jsx("small",{className:"text-muted",children:"Choose medicines to compare."})]}),e.jsxs("div",{className:"step-wrapper",children:[e.jsx("div",{className:"step-icon icon-blue",children:e.jsx("i",{className:"fa fa-balance-scale"})}),e.jsx("h6",{className:"fw-bold mb-0",children:"Compare Options"}),e.jsx("small",{className:"text-muted",children:"View prices side-by-side."})]}),e.jsxs("div",{className:"step-wrapper",children:[e.jsx("div",{className:"step-icon icon-orange",children:e.jsx("i",{className:"fa fa-shopping-cart"})}),e.jsx("h6",{className:"fw-bold mb-0",children:"Add to Cart"}),e.jsx("small",{className:"text-muted",children:"Select your preferred option."})]}),e.jsxs("div",{className:"step-wrapper mb-0",children:[e.jsx("div",{className:"step-icon icon-light",children:e.jsx("i",{className:"fa fa-truck"})}),e.jsx("h6",{className:"fw-bold mb-0",children:"Complete Order"}),e.jsx("small",{className:"text-muted",children:"Fast & secure delivery."})]})]})]}),e.jsx("div",{className:"col-md-6 text-center d-none d-md-block",children:e.jsx("img",{src:"/assets/medicicomrepage.png",className:"img-fluid mobile-img",alt:"App Preview"})})]})})})]})})}),e.jsx("style",{children:`
        .compare-section {
          background: #f8f9fa;
          border-radius: 20px;
          padding: 25px 30px;
        }

        .steps-container {
          position: relative;
          padding-left: 60px;
        }

        .steps-container::before {
          content: "";
          position: absolute;
          left: 17px;
          top: 12px;
          bottom: 12px;
          border-left: 3px dotted #d2d2d2;
        }

        .step-wrapper {
          position: relative;
          margin-bottom: 22px;
        }

        .step-icon {
          position: absolute;
          left: -60px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 13px;
          z-index: 2;
        }

        .icon-purple { background: #7c4dff; }
        .icon-teal { background: #00bcd4; }
        .icon-blue { background: #3f51b5; }
        .icon-orange { background: #ff5722; }
        .icon-light { background: #4dd0e1; }

        .mobile-img {
          width: 100%;
          height: auto;
          max-height: 420px;
          object-fit: contain;
        }

        .custom-modal {
          max-width: 800px;
        }

        .modal-content {
          border-radius: 20px;
        }

        .modal-header {
          position: absolute;
          right: 15px;
          top: 15px;
          z-index: 10;
          border: none;
        }

        @media (min-width: 992px) {
          .compare-section {
            padding: 20px 20px;
          }
        }

        @media (max-width: 768px) {
          .custom-modal {
            max-width: 95%;
            margin: auto;
          }
        }
      `})]}):null},C=({imgUrl:i,discountProducts:d,supersaving:l,popularProducts:t,trendingProducts:c,handleProductClick:n,middleBanners:s,settings:o,service:p,categories:y})=>{const x=g(),r=p||x.service||"medicine";b(),j();const[h,u]=a.useState(!1);return a.useEffect(()=>{(r==="medicine"||r==="medicines")&&u(!0)},[r]),e.jsxs(e.Fragment,{children:[e.jsx(N,{page:"medicines"}),e.jsx(w,{triggerShow:h}),s?.length>0&&e.jsx("section",{className:"section welcome-section px-3 mt-3 offers-section",style:{backgroundColor:"#ffffff"},children:e.jsxs("div",{className:"container-fluid",children:[e.jsx("div",{className:"text-center mb-3",children:e.jsxs("h2",{className:"mb-3",style:{fontSize:"28px",fontWeight:"600",color:"#1a1a1a"},children:[e.jsx("i",{className:"fas fa-bolt text-warning me-2"}),"Offers & Promotions"]})}),s.length>1?e.jsx(v,{...o,children:s.map((m,f)=>e.jsx("div",{className:"col-lg-4 col-md-6 d-flex",children:e.jsx("img",{src:m.src,alt:m.alt,loading:"lazy",className:"px-1",style:{borderRadius:"10px"}})},f))}):e.jsx("div",{className:"col-lg-12 d-flex",children:e.jsx("img",{src:s[0]?.src,alt:s[0]?.alt,title:s[0]?.alt,loading:"lazy",className:"px-1",style:{borderRadius:"10px"}})})]})})]})};export{C as default};
