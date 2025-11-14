import Button from "@/components/modules/Button";
import BlurText from "@/components/templates/index/BlurWords";
import PopularFoods from "@/components/templates/index/PopularFoods";
import Slider from "@/components/templates/index/Slider";
import WordsFocus from "@/components/templates/index/WordsFocus";
import { IoRestaurantOutline } from "react-icons/io5";
import { GrLocationPin } from "react-icons/gr";

function Index() {
  return (
    <>
      <div
        className="bg-cover bg-center bg-[#505050e6] bg-blend-multiply pt-20 "
        style={{
          backgroundImage: "url(/image/deliciousMeal.jpg)",
        }}
      >
        <WordsFocus
          sentence="خانه برگر"
          blurAmount={5}
          borderColor="white"
          animationDuration={2}
          pauseBetweenAnimations={1}
        />
        <BlurText
          text="کیفیت مهم تر از همیشه"
          delay={500}
          animateBy="words"
          direction="top"
          className="mt-2 md:text-4xl text-2xl"
        />

        <div className="flex  items-start flex-col sm:flex-row mt-2 p-6 gap-y-3">
          <Button
            title="منو"
            icon={<IoRestaurantOutline className="w-5 h-5" />}
            href="/menu/breakfast"
            className="bg-night/45 text-saffron border border-platinum/50 hover:text-inherit hover:bg-saffron/30 max-[450px]:w-32 max-[450px]:text-[12px]"
          />

          <Button
            title="لوکیشن"
            icon={<GrLocationPin className="w-5 h-5" />}
            clickHandler={() => console.log("location need to define!")}
            className="bg-night/45 text-saffron border border-platinum/50 hover:text-inherit hover:bg-saffron/30 max-[450px]:w-32 max-[450px]:text-[12px]"
          />
        </div>
        <PopularFoods />
      </div>
      <Slider />
    </>
  );
}

export default Index;
