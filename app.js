(function () {
  'use strict';

  /** 中心 X 座標 */
  const CX = 250;
  /** 中心 Y 座標 */
  const CY = 250;
  /** http://www.whizkidtech.redprince.net/bezier/circle/kappa/ */
  const KAPPA = (-1 + Math.sqrt(2)) / 3 * 4;

  class ArcStarategy {
    drawCircle(param) {
      const rx = param.rx;
      const ry = param.figure === 'circle' ? rx : param.ry;
      return [
        ['M', CX - rx, CY],
        ['A', rx, ry, 0, 1, 0, CX + rx, CY],
        ['A', rx, ry, 0, 1, 0, CX - rx, CY],
      ];
    }

    drawControlPoints(param) {
      return this.drawCircle(param)
        .filter(op => op[0] === 'A')
        .map(op => [op[6], op[7]]);
    }

    hasSupported(strategy) {
      return strategy === 'circle' ||
             strategy === 'ellipse';
    }
  }

  class CubicBezierStarategy {
    drawCircle(param) {
      const rx = param.rx;
      const ry = param.figure === 'circle' ? rx : param.ry;
      return [
        ['M', CX - rx, CY],
        ['C', CX - rx, CY - KAPPA * ry, CX - KAPPA * rx, CY - ry, CX, CY - ry],
        ['C', CX + KAPPA * rx, CY - ry, CX + rx, CY - KAPPA * ry, CX + rx, CY],
        ['C', CX + rx, CY + KAPPA * ry, CX + KAPPA * rx, CY + ry, CX, CY + ry],
        ['C', CX - KAPPA * rx, CY + ry, CX - rx, CY + KAPPA * ry, CX - rx, CY],
      ];
    }

    drawControlPoints(param) {
      return this.drawCircle(param)
        .filter(op => op[0] === 'C')
        .reduce(
          (list,op) => list.concat([[op[1], op[2]], [op[3], op[4]], [op[5], op[6]]]),
          []
        );
    }

    hasSupported(strategy) {
      return strategy === 'circle' ||
             strategy === 'ellipse';
    }
  }

  class QuadBezierStarategy {
    /**
     * http://www.fumiononaka.com/TechNotes/Flash/FN0506002.html
     */
    drawCircle(param) {
      const r = param.r;
      const SEGMENTS = 8;
      const angle = 2 * Math.PI / SEGMENTS;
      let paths = [['M', CX + r, CY]];
      for (let i = 1; i <= SEGMENTS; ++i) {
        const theta = i * angle;
        const anchorX = r * Math.cos(theta);
        const anchorY = r * Math.sin(theta);
        const controlX = anchorX + r * Math.tan(angle / 2) * Math.cos(theta - Math.PI / 2);
        const controlY = anchorY + r * Math.tan(angle / 2) * Math.sin(theta - Math.PI / 2);
        paths.push(['Q', controlX + CX, controlY + CY, anchorX + CX, anchorY + CY]);
      }
      return paths;
    }

    drawControlPoints(param) {
      return this.drawCircle(param)
        .filter(op => op[0] === 'Q')
        .reduce(
          (list,op) => list.concat([[op[1], op[2]], [op[3], op[4]]]),
          []
        );
    }

    hasSupported(strategy) {
      return strategy === 'circle';
    }
  }

  const STRATEGIES = {
    arc: new ArcStarategy,
    cubic_bezier: new CubicBezierStarategy,
    quad_bezier: new QuadBezierStarategy,
  };

  new Vue({
    el: '#app',
    data: {
      width: '500px',
      height: '500px',
      figure: 'circle',
      rx: 100,
      ry: 100,
      strategy: 'arc',
      hidePoints: false,
    },
    computed: {
      drawCircle() {
        const ops = this.getCirclePaths();
        return ops.map(op => op.join(' ')).join(' ');
      },
      pathLines() {
        return this.getCirclePaths()
          .map(op => [op[0], ... op.slice(1).map(Math.round)].join(' '));
      },
      drawControlPoints() {
        if (STRATEGIES[this.strategy]) {
          const param = this.makeParameter();
          const points = STRATEGIES[this.strategy].drawControlPoints(param);
          return points.map(p => ({
            x: p[0],
            y: p[1],
            r: '5px',
            text: this.getCoordText(p)
          }));
        }
        return [];
      },
    },
    methods: {
      getCirclePaths() {
        if (STRATEGIES[this.strategy]) {
          const param = this.makeParameter();
          return STRATEGIES[this.strategy].drawCircle(param)
        }
        return [];
      },
      getCoordText(p) {
        const x = Math.round(p[0]);
        const y = Math.round(p[1]);
        return `(${x}, ${y})`;
      },
      makeParameter() {
        return {
          r: this.rx,
          rx: this.rx,
          ry: this.ry,
          figure: this.figure,
        };
      },
      hasSupported(figure) {
        if (STRATEGIES[this.strategy]) {
          return STRATEGIES[this.strategy].hasSupported(figure);
        }
        return false;
      }
    }
  });

})();
