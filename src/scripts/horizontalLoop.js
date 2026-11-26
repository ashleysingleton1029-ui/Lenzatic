// Seamless, draggable horizontal loop.
// Adapted from GreenSock's published "horizontalLoop" helper
// (https://gsap.com/docs/v3/HelperFunctions/helpers/seamlessLoop).
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

gsap.registerPlugin(Draggable, InertiaPlugin);

/**
 * @param {HTMLElement[]} items
 * @param {{ repeat?: number, paused?: boolean, speed?: number, snap?: number | false,
 *   center?: boolean | Element, draggable?: boolean, reversed?: boolean,
 *   onChange?: (el: HTMLElement, index: number) => void }} config
 */
export function horizontalLoop(items, config = {}) {
  let timeline;
  items = gsap.utils.toArray(items);

  gsap.context(() => {
    const onChange = config.onChange;
    let lastIndex = 0;
    const tl = gsap.timeline({
      repeat: config.repeat,
      paused: config.paused,
      defaults: { ease: 'none' },
      onUpdate:
        onChange &&
        function () {
          const i = tl.closestIndex();
          if (lastIndex !== i) {
            lastIndex = i;
            onChange(items[i], i);
          }
        },
      onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100),
    });
    const length = items.length;
    const startX = items[0].offsetLeft;
    const times = [];
    const widths = [];
    const spaceBefore = [];
    const xPercents = [];
    let curIndex = 0;
    let indexIsDirty = false;
    const center = config.center;
    const pixelsPerSecond = (config.speed ?? 1) * 30;
    const snap = config.snap === false ? (v) => v : gsap.utils.snap(config.snap || 1);
    let timeOffset = 0;
    const container =
      center === true ? items[0].parentNode : gsap.utils.toArray(center)[0] || items[0].parentNode;
    let totalWidth;
    let timeWrap;
    let proxy;

    const getTotalWidth = () =>
      items.reduce((sum, _el, i) => sum + widths[i] + (spaceBefore[i] || 0), 0);

    const populateWidths = () => {
      let b1 = container.getBoundingClientRect();
      let b2;
      items.forEach((el, i) => {
        widths[i] = parseFloat(gsap.getProperty(el, 'width', 'px'));
        xPercents[i] = snap(
          (parseFloat(gsap.getProperty(el, 'x', 'px')) / widths[i]) * 100 +
            gsap.getProperty(el, 'xPercent'),
        );
        b2 = el.getBoundingClientRect();
        spaceBefore[i] = b2.left - (i ? b1.right : b1.left);
        b1 = b2;
      });
      gsap.set(items, { xPercent: (i) => xPercents[i] });
      totalWidth = getTotalWidth();
    };

    const populateOffsets = () => {
      timeOffset = center ? (tl.duration() * (container.offsetWidth / 2)) / totalWidth : 0;
      if (center) {
        times.forEach((_t, i) => {
          times[i] = timeWrap(
            tl.labels['label' + i] + (tl.duration() * widths[i]) / 2 / totalWidth - timeOffset,
          );
        });
      }
    };

    const getClosest = (values, value, wrap) => {
      let i = values.length;
      let closest = 1e10;
      let index = 0;
      while (i--) {
        let d = Math.abs(values[i] - value);
        if (d > wrap / 2) d = wrap - d;
        if (d < closest) {
          closest = d;
          index = i;
        }
      }
      return index;
    };

    const populateTimeline = () => {
      tl.clear();
      for (let i = 0; i < length; i++) {
        const item = items[i];
        const curX = (xPercents[i] / 100) * widths[i];
        const distanceToStart = item.offsetLeft + curX - startX + spaceBefore[0];
        const distanceToLoop = distanceToStart + widths[i] * gsap.getProperty(item, 'scaleX');
        tl.to(
          item,
          {
            xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
            duration: distanceToLoop / pixelsPerSecond,
          },
          0,
        )
          .fromTo(
            item,
            { xPercent: snap(((curX - distanceToLoop + totalWidth) / widths[i]) * 100) },
            {
              xPercent: xPercents[i],
              duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
              immediateRender: false,
            },
            distanceToLoop / pixelsPerSecond,
          )
          .add('label' + i, distanceToStart / pixelsPerSecond);
        times[i] = distanceToStart / pixelsPerSecond;
      }
      timeWrap = gsap.utils.wrap(0, tl.duration());
    };

    const refresh = (deep) => {
      const progress = tl.progress();
      tl.progress(0, true);
      populateWidths();
      if (deep) populateTimeline();
      populateOffsets();
      if (deep && tl.draggable) tl.time(times[curIndex], true);
      else tl.progress(progress, true);
    };
    const onResize = () => refresh(true);

    function toIndex(index, vars = {}) {
      if (Math.abs(index - curIndex) > length / 2) index += index > curIndex ? -length : length;
      const newIndex = gsap.utils.wrap(0, length, index);
      let time = times[newIndex];
      if (time > tl.time() !== index > curIndex && index !== curIndex) {
        time += tl.duration() * (index > curIndex ? 1 : -1);
      }
      if (time < 0 || time > tl.duration()) vars.modifiers = { time: timeWrap };
      curIndex = newIndex;
      vars.overwrite = true;
      gsap.killTweensOf(proxy);
      const wasPlaying = !tl.paused();
      if (vars.duration === 0) {
        tl.time(timeWrap(time));
        if (wasPlaying) tl.play();
        return tl;
      }
      const userComplete = vars.onComplete;
      vars.onComplete = function () {
        if (userComplete) userComplete.apply(this, arguments);
        if (wasPlaying) tl.play();
      };
      return tl.tweenTo(time, vars);
    }

    gsap.set(items, { x: 0 });
    populateWidths();
    populateTimeline();
    populateOffsets();
    window.addEventListener('resize', onResize);

    tl.toIndex = (index, vars) => toIndex(index, vars);
    tl.closestIndex = (setCurrent) => {
      const index = getClosest(times, tl.time(), tl.duration());
      if (setCurrent) {
        curIndex = index;
        indexIsDirty = false;
      }
      return index;
    };
    tl.current = () => (indexIsDirty ? tl.closestIndex(true) : curIndex);
    tl.next = (vars) => toIndex(tl.current() + 1, vars);
    tl.previous = (vars) => toIndex(tl.current() - 1, vars);
    tl.times = times;
    tl.progress(1, true).progress(0, true);
    if (config.reversed) {
      tl.vars.onReverseComplete();
      tl.reverse();
    }

    if (config.draggable) {
      proxy = document.createElement('div');
      const wrap = gsap.utils.wrap(0, 1);
      let ratio;
      let startProgress;
      let draggable;
      let lastSnap;
      let initChangeX;
      let wasPlaying;
      const align = () => tl.progress(wrap(startProgress + (draggable.startX - draggable.x) * ratio));
      const syncIndex = () => tl.closestIndex(true);

      draggable = Draggable.create(proxy, {
        trigger: items[0].parentNode,
        type: 'x',
        onPressInit() {
          const x = this.x;
          gsap.killTweensOf(tl);
          wasPlaying = !tl.paused();
          tl.pause();
          startProgress = tl.progress();
          refresh();
          ratio = 1 / totalWidth;
          initChangeX = startProgress / -ratio - x;
          gsap.set(proxy, { x: startProgress / -ratio });
        },
        onDrag: align,
        onThrowUpdate: align,
        overshootTolerance: 0,
        dragResistance: 0.2,
        inertia: true,
        throwResistance: 20,
        maxDuration: 1,
        snap(value) {
          // A tap (barely moved) shouldn't snap anywhere new.
          if (Math.abs(startProgress / -ratio - this.x) < 10) return lastSnap + initChangeX;
          const time = -(value * ratio) * tl.duration();
          const wrappedTime = timeWrap(time);
          let snapTime = times[getClosest(times, wrappedTime, tl.duration())];
          let dif = snapTime - wrappedTime;
          if (Math.abs(dif) > tl.duration() / 2) dif += dif < 0 ? tl.duration() : -tl.duration();
          lastSnap = (time + dif) / tl.duration() / -ratio;
          return lastSnap;
        },
        onRelease() {
          syncIndex();
          if (draggable.isThrowing) indexIsDirty = true;
        },
        onThrowComplete: () => {
          syncIndex();
          if (wasPlaying) tl.play();
        },
      })[0];
      tl.draggable = draggable;
    }

    tl.closestIndex(true);
    lastIndex = curIndex;
    if (onChange) onChange(items[curIndex], curIndex);
    timeline = tl;
    return () => window.removeEventListener('resize', onResize);
  });

  return timeline;
}
